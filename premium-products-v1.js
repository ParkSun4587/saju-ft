(function (global) {
  "use strict";

  const CONCERNS = {
    money: "돈·재물",
    career: "학업·직장",
    love: "연애·썸",
    path: "진로·적성",
    people: "사람·관계",
    mental: "마음·스트레스",
  };

  const PRODUCTS = {
    concern_bundle3: {
      id: "concern_bundle3",
      name: "고민 3개 더 깊게",
      price: 2900,
      badge: "다른 고민도 궁금하다면",
      desc: "지금 본 고민 말고 궁금한 고민 3개를 골라, 고민마다 NOTE 1~6을 전부 받아. 총 18개 메모로 이어서 보는 구성.",
    },
    full_saju: {
      id: "full_saju",
      name: "내 전체 사주판",
      price: 4900,
      badge: "정석 종합판",
      desc: "지금 고민을 다시 푸는 상품이 아니라, 타고난 기질·강점·과부하·결정법·일·돈·사랑·관계·회복·변화 대응까지 사주 전체를 12개 챕터로 연결해 봐.",
    },
    compatibility: {
      id: "compatibility",
      name: "우리 둘 궁합",
      price: 5900,
      badge: "상대 생일 하나 더",
      desc: "두 사람의 사주를 각각 계산해서 끌림·연애 방식·대화·갈등·화해·애정표현·거리감·생활·돈·장기 관계까지 16개 챕터로 깊게 봐.",
    },
    all_in_one: {
      id: "all_in_one",
      name: "어떤언니 올인원",
      price: 9900,
      badge: "가장 깊은 전체판",
      desc: "내 전체 사주판 12개 챕터 + 내 고민 6가지 NOTE 36개를 한 번에 보는 가장 큰 리포트야. 상대 정보가 필요한 궁합은 별도 상품이야.",
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
      ? "이 리포트는 지금 선택한 고민 6개를 다시 요약하는 상품이 아니다. 사주 전체에서 반복되는 기질·강점·과부하·판단법·관계·회복·변화 대응을 한 번에 묶은 기본 지도다."
      : "이건 지금 선택한 고민을 또 풀어쓰는 리포트가 아니야. 언니가 네 사주 전체를 펼쳐놓고, 어떤 고민을 만나도 반복해서 나타나는 기질·강점·지치는 방식·사람 보는 법·회복법을 한 장으로 이어주는 ‘내 사용설명서’에 가까워 💕";
    const sections = fullSajuSections(data, mode);
    return `<div data-export-intro="full" style="padding:14px 15px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;font-size:12.5px;line-height:1.8;color:#7c2d12;margin-bottom:8px"><b>이 리포트에서 보는 것</b><br>${intro}</div>${sections.map((s, index) => `<section data-export-kind="full" data-export-index="${index}" style="padding:18px 0;border-bottom:1px solid #eef2f7"><h4 style="font-size:15px;font-weight:900;margin:0 0 8px">${s.title}</h4><div style="font-size:13px;line-height:1.85;color:#475569">${s.body}</div></section>`).join("")}`;
  }


  function bundleHtml(data, mode, extra) {
    const keys = Array.isArray(extra?.concerns) ? extra.concerns : [];
    return keys.map((key) => {
      const d = { ...data, concernKey: key };
      const notes = typeof global.generateConcernNotes === "function" ? global.generateConcernNotes(d, mode) : [];
      return `<section data-export-kind="concern" data-concern="${esc(key)}" style="margin-bottom:26px"><h3 style="font-size:19px;font-weight:950;margin:0 0 10px">${esc(CONCERNS[key] || key)}</h3>${noteCards(notes)}</section>`;
    }).join("");
  }

  function allInOneHtml(data, mode) {
    const all = Object.keys(CONCERNS).map((key) => {
      const d = { ...data, concernKey: key };
      const notes = typeof global.generateConcernNotes === "function" ? global.generateConcernNotes(d, mode) : [];
      return `<section data-export-kind="concern" data-concern="${esc(key)}" style="margin:26px 0"><h3 style="font-size:19px;font-weight:950;margin:0 0 10px">${esc(CONCERNS[key])}</h3>${noteCards(notes)}</section>`;
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
    if (!partner) return `<p style="font-size:13px;line-height:1.8;color:#475569">상대 생년월일 정보를 다시 확인해줘. 정확한 사주가 계산돼야 궁합을 열 수 있어.</p>`;

    const pName = extra?.partner?.n || "상대";
    const safeName = esc(pName);
    const a = elementOf(data);
    const b = elementOf(partner);
    const relation = relationCopy(a, b, isT);
    const myP = getProfile(data);
    const partnerP = getProfile(partner);

    if (!myP || !partnerP) {
      return `<p style="font-size:13px;line-height:1.8;color:#475569">두 사람의 사주 정보를 충분히 읽지 못했어. 입력값을 다시 확인해줘.</p>`;
    }

    const myDom = myP.sipsin?.dominantHuman || "내 기준을 찾고 움직이는 성향";
    const partnerDom = partnerP.sipsin?.dominantHuman || "자기 기준을 찾고 움직이는 성향";
    const mySecond = myP.sipsin?.secondaryHuman || "";
    const partnerSecond = partnerP.sipsin?.secondaryHuman || "";
    const myStrong = ELEMENT_WORD[myP.elements?.influenceRank?.strongest] || "익숙한 방식으로 밀어가는 힘";
    const partnerStrong = ELEMENT_WORD[partnerP.elements?.influenceRank?.strongest] || "익숙한 방식으로 밀어가는 힘";
    const myWeak = ELEMENT_WORD[myP.elements?.influenceRank?.weakest] || "일부러 챙겨야 하는 힘";
    const partnerWeak = ELEMENT_WORD[partnerP.elements?.influenceRank?.weakest] || "일부러 챙겨야 하는 힘";
    const myNeed = myP.elements?.primaryBehavior?.verb || "내 기준을 먼저 확인하는 것";
    const partnerNeed = partnerP.elements?.primaryBehavior?.verb || "자기 기준을 먼저 확인하는 것";
    const mySecondNeed = myP.elements?.secondaryBehavior?.verb || myNeed;
    const partnerSecondNeed = partnerP.elements?.secondaryBehavior?.verb || partnerNeed;
    const myAvoid = myP.elements?.avoidBehavior?.verb || "한 가지 방식만 계속 밀어붙이는 것";
    const partnerAvoid = partnerP.elements?.avoidBehavior?.verb || "한 가지 방식만 계속 밀어붙이는 것";
    const myClimate = myP.balance?.climateHuman || "속도를 조절하면서 현실 반응을 확인하는 쪽";
    const partnerClimate = partnerP.balance?.climateHuman || "속도를 조절하면서 현실 반응을 확인하는 쪽";
    const myWeakStat = myP.behavior?.weakStatHuman || "내가 실제로 소모되는 지점을 확인하는 것";
    const partnerWeakStat = partnerP.behavior?.weakStatHuman || "자기가 실제로 소모되는 지점을 확인하는 것";
    const myClash = !!myP.relations?.hasClash;
    const partnerClash = !!partnerP.relations?.hasClash;
    const sameStrength = myP.strength?.code === partnerP.strength?.code;
    const sameStrongElement = myP.elements?.influenceRank?.strongest === partnerP.elements?.influenceRank?.strongest;
    const bothClash = myClash && partnerClash;

    const intro = isT
      ? `궁합은 ‘좋다/나쁘다’ 한 줄로 끝내면 쓸모가 없어. 너와 ${safeName}의 사주를 따로 본 다음, 실제 관계에서 어디가 맞고 어디서 충돌하는지 16개 항목으로 나눠서 볼게.`
      : `궁합은 그냥 “둘이 잘 맞아” 한마디 듣고 끝내면 너무 아깝잖아. 언니가 너랑 ${safeName} 사주를 따로 펼쳐놓고, 왜 끌리고 어디서 서운해지고 어떻게 해야 오래 편한지까지 16개로 차근차근 풀어줄게.`;

    const cards = [
      {
        title: "01 · 둘 사이를 한 문장으로 보면",
        body: isT
          ? `${relation} 너는 <b>${myDom}</b> 쪽, ${safeName}은 <b>${partnerDom}</b> 쪽이 강하다. 둘의 차이는 애정의 크기보다 반응 방식 차이로 보는 게 정확해.`
          : `${relation} 너는 <b>${myDom}</b> 쪽으로 마음이 움직이고, ${safeName}은 <b>${partnerDom}</b> 쪽으로 반응하는 편이야. 그래서 같은 마음이어도 표현되는 모양은 꽤 다를 수 있어. 그 차이를 “나를 덜 좋아하나?”로 번역하지 않는 게 첫 번째야.`
      },
      {
        title: "02 · 처음 서로에게 끌리는 이유",
        body: isT
          ? `너의 <b>${myStrong}</b>과 ${safeName}의 <b>${partnerStrong}</b>이 관계의 첫 인상을 만든다. ${sameStrongElement ? "강점이 비슷해서 상대 방식이 빨리 읽히는 조합이다." : "강점이 달라 서로에게 없는 면이 매력으로 보일 가능성이 있다."}`
          : `처음에는 네 <b>${myStrong}</b>과 ${safeName}의 <b>${partnerStrong}</b>이 서로 눈에 들어오기 쉬워. ${sameStrongElement ? "둘이 비슷한 힘을 써서 ‘이 사람은 말 안 해도 좀 알겠다’ 싶은 순간이 생길 수 있어." : "서로 잘하는 방향이 달라서 ‘나한테 없는 게 저 사람한테 있네’ 하고 끌릴 수 있어."}`
      },
      {
        title: "03 · 내가 사랑할 때 나오는 모습",
        body: isT
          ? `너는 연애에서도 <b>${myDom}</b>이 기본 반응으로 나온다. ${myP.strength?.T || ""}. 사랑한다고 해서 네 기본 작동 방식이 사라지지는 않아.`
          : `너는 좋아하는 사람이 생겨도 기본적으로 <b>${myDom}</b> 쪽으로 마음을 써. ${myP.strength?.F || ""}. 그러니까 사랑할수록 잘해주려고 애쓰는 부분과, 혼자 견디려고 하는 부분을 같이 봐줘야 해.`
      },
      {
        title: `04 · ${safeName}이 사랑할 때 나오는 모습`,
        body: isT
          ? `${safeName}은 <b>${partnerDom}</b> 쪽이 먼저 나온다${partnerSecond ? `, 그다음에는 ${partnerSecond}` : ""}. ${partnerP.strength?.T || ""}. 상대 반응을 네 방식으로만 해석하면 오판할 수 있어.`
          : `${safeName}은 마음이 생겼을 때 <b>${partnerDom}</b> 쪽으로 먼저 표현하는 편이야${partnerSecond ? `. 그 안에는 ${partnerSecond}도 같이 있고` : ""}. ${partnerP.strength?.F || ""}. 네가 기대한 표현이 아니어도 저 사람 나름의 사랑 방식일 수 있다는 걸 같이 봐야 해.`
      },
      {
        title: "05 · 말이 잘 통할 때와 엇갈릴 때",
        body: isT
          ? `대화가 잘 될 때는 서로 결론보다 기준을 먼저 공개할 때다. 너는 <b>${myNeed}</b>, ${safeName}은 <b>${partnerNeed}</b>이 필요하다. 상대가 알아서 눈치채길 기다리지 마.`
          : `둘이 대화할 때 제일 중요한 건 “왜 그것밖에 몰라?”가 아니라 각자 필요한 걸 먼저 말해주는 거야. 너는 <b>${myNeed}</b>이 필요하고, ${safeName}은 <b>${partnerNeed}</b>이 필요해. 서로 마음을 맞히는 게임처럼 만들지 않았으면 좋겠어.`
      },
      {
        title: "06 · 서운함이 시작되는 포인트",
        body: isT
          ? `너는 <b>${myWeak}</b> 쪽이 밀리면 피로가 커지고, ${safeName}은 <b>${partnerWeak}</b> 쪽이 밀릴 때 예민해질 수 있다. 겉으로 드러난 말보다 그 직전 무엇이 부족했는지 봐.`
          : `싸움은 갑자기 생긴 것 같아도 그 전에 작은 서운함이 쌓여 있는 경우가 많아. 너는 <b>${myWeak}</b>이 부족해질 때 마음이 메말라지고, ${safeName}은 <b>${partnerWeak}</b>이 빠질 때 자기답지 않게 예민해질 수 있어. 그 순간을 빨리 알아보는 게 중요해.`
      },
      {
        title: "07 · 싸움이 커지는 순서",
        body: isT
          ? `${bothClash ? "둘 다 누적 후 한 번에 뒤집는 반응이 가능해서 싸움이 시작되면 확 커질 수 있다." : myClash ? "너는 참다가 한 번에 방향을 바꾸는 반응을 조심해야 한다." : partnerClash ? safeName + " 쪽이 쌓아두다 한 번에 반응할 수 있다." : "둘 다 큰 사건보다 작은 불편함을 방치하는 게 더 위험하다."} 특히 너의 <b>${myAvoid}</b>, 상대의 <b>${partnerAvoid}</b>이 동시에 나오면 대화를 중단하고 식히는 게 낫다.`
          : `${bothClash ? "둘 다 참다가 한 번에 확 돌아서는 순간이 생길 수 있어서, 작은 싸움도 타이밍이 나쁘면 크게 번질 수 있어." : myClash ? "너는 괜찮은 척 참다가 어느 순간 마음이 확 닫힐 수 있어." : partnerClash ? `${safeName}이 말이 없다가 갑자기 선을 긋는 순간이 생길 수 있어.` : "둘 다 작은 불편함을 ‘이 정도는 넘기자’ 하고 미루다가 서운함이 커질 수 있어."} 특히 네가 <b>${myAvoid}</b>, 상대가 <b>${partnerAvoid}</b>만 반복하고 있으면 그날은 결론까지 내지 말고 잠깐 식히자.`
      },
      {
        title: "08 · 싸운 뒤 화해하는 법",
        body: isT
          ? `화해 순서는 감정 정리 → 사실 확인 → 다음 규칙 합의가 맞다. 너는 <b>${mySecondNeed}</b>, ${safeName}은 <b>${partnerSecondNeed}</b>을 넣어야 같은 싸움이 반복되지 않는다.`
          : `화해할 때 “미안해, 됐지?”로 빨리 덮기보다 서로 뭐가 아팠는지 한 번은 확인해줘. 너한테는 <b>${mySecondNeed}</b>이 도움이 되고, ${safeName}에게는 <b>${partnerSecondNeed}</b>이 필요해. 사과보다 다음번에 달라지는 행동이 둘 마음을 더 안심시켜줘.`
      },
      {
        title: "09 · 애정 표현이 어긋나는 순간",
        body: isT
          ? `${sameStrength ? "둘의 에너지 운용 방식이 비슷해서 표현 강도는 맞기 쉽다." : "에너지 운용 방식이 달라 한쪽은 충분히 표현했다고 느끼는데 다른 쪽은 부족하다고 느낄 수 있다."} 말, 연락, 행동 중 무엇을 애정의 증거로 보는지 직접 맞춰.`
          : `${sameStrength ? "둘은 마음을 쓰는 속도가 비슷해서 어느 정도 리듬을 맞추기 쉬운 편이야." : "한 사람은 충분히 하고 있다고 생각하는데 다른 사람은 ‘왜 이렇게 멀지?’ 하고 느끼는 순간이 생길 수 있어."} 그래서 “난 연락이 이 정도면 안심돼”, “난 말보다 행동이 더 중요해”처럼 사랑받는 느낌이 드는 방식을 구체적으로 말해주는 게 좋아.`
      },
      {
        title: "10 · 연락과 혼자 있는 시간",
        body: isT
          ? `너는 <b>${myClimate}</b>, ${safeName}은 <b>${partnerClimate}</b>이 편하다. 연락 빈도를 사랑의 점수로 쓰지 말고 각자 회복에 필요한 시간을 먼저 정해.`
          : `연락이 많아야 사랑이고 혼자 있고 싶으면 식은 마음이라고 단정하지 말자. 너는 <b>${myClimate}</b>일 때 편하고, ${safeName}은 <b>${partnerClimate}</b>일 때 자기 리듬을 찾기 쉬워. 서로 숨 돌릴 시간을 인정해주면 오히려 관계가 덜 불안해져.`
      },
      {
        title: "11 · 일상에서 같이 살기 편하려면",
        body: isT
          ? `연애 감정보다 생활 규칙에서 갈등이 오래 간다. 일정, 약속시간, 집안일, 휴식 방식 중 반복 충돌하는 항목은 담당과 기준을 명확히 해. 추측 대신 규칙이 낫다.`
          : `좋아하는 마음이 커도 생활 리듬이 계속 안 맞으면 사소한 일로 지치기 쉬워. 약속시간, 쉬는 방식, 집안일, 주말 계획 같은 건 “사랑하면 알아서 맞겠지” 하지 말고 둘만의 기준을 만들어두는 게 훨씬 편해.`
      },
      {
        title: "12 · 돈과 현실 문제를 같이 다룰 때",
        body: isT
          ? `관계에서 돈은 감정보다 기준 문제다. 너는 <b>${myWeakStat}</b>, ${safeName}은 <b>${partnerWeakStat}</b>을 놓치면 현실 스트레스가 관계 감정으로 번질 수 있다. 비용·선물·여행·저축 기준을 미리 말해.`
          : `돈 얘기는 사랑이 부족해서 불편한 게 아니라 서로 기준이 다르면 누구나 조심스러워져. 너는 <b>${myWeakStat}</b>을, ${safeName}은 <b>${partnerWeakStat}</b>을 놓치지 않는 게 중요해. 데이트비, 선물, 여행, 큰 지출은 마음 눈치 보지 말고 미리 얘기하는 게 오히려 덜 상처받아.`
      },
      {
        title: "13 · 질투·경계·사생활",
        body: isT
          ? `경계선은 애매하게 두지 마. 친구 관계, 전 연인, SNS, 연락 공개 범위처럼 싸움이 날 수 있는 항목은 허용/불편 기준을 구체적으로 맞춰. 통제와 배려를 섞지 않는 게 핵심이다.`
          : `사랑하면 다 보여줘야 한다거나, 믿으면 아무 말도 하면 안 된다는 식으로 극단적으로 가지 않았으면 좋겠어. 친구, 전 연인, SNS, 개인시간처럼 민감한 부분은 “난 여기까지는 괜찮고 여기부터는 불편해”라고 말해도 돼. 경계를 말하는 건 상대를 못 믿는다는 뜻이 아니야.`
      },
      {
        title: "14 · 오래 만날수록 좋아지는 부분",
        body: isT
          ? `${sameStrongElement ? "서로의 강점을 빠르게 이해하는 조합이라 역할만 잘 나누면 안정감이 커질 수 있다." : "서로 다른 강점을 실제 생활에서 보완 관계로 쓰면 시간이 갈수록 효율이 좋아질 수 있다."} 핵심은 상대를 바꾸는 게 아니라 각자 잘하는 영역을 인정하는 것.`
          : `${sameStrongElement ? "시간이 지나면 서로 왜 그렇게 행동하는지 더 빨리 알아차릴 수 있어서 편안함이 커질 수 있어." : "서로 다른 장점을 경쟁시키지 않고 ‘이건 네가 더 잘하네’ 하고 맡길 수 있게 되면 관계가 훨씬 단단해질 수 있어."} 오래 갈수록 중요한 건 닮아지는 게 아니라 서로를 다루는 법을 익히는 거야.`
      },
      {
        title: "15 · 이 관계에서 꼭 조심할 신호",
        body: isT
          ? `위험 신호는 세 가지다. <b>말 안 하고 시험하기</b>, <b>상대 방식만 문제라고 단정하기</b>, <b>작은 불편함을 쌓아 한 번에 정리하기</b>. 이 셋이 반복되면 궁합보다 운영 방식이 문제다.`
          : `언니가 이 관계에서 제일 조심하라고 하고 싶은 건 세 가지야. 마음을 말하지 않고 상대가 알아채나 시험하는 것, 내 방식만 사랑의 정답이라고 생각하는 것, 괜찮은 척 쌓아두다가 한 번에 끝내버리는 것. 이게 반복되면 원래 잘 맞는 부분도 점점 안 보이게 돼.`
      },
      {
        title: "16 · 둘이 실제로 지키면 좋은 약속",
        body: isT
          ? `<b>1.</b> 서운함은 24시간 안에 말하기.<br><b>2.</b> 싸울 때 관계 전체를 평가하지 않기.<br><b>3.</b> 연락·돈·개인시간 기준을 미리 합의하기.<br><b>4.</b> 너는 ${myNeed}, ${safeName}은 ${partnerNeed}을 존중하기.<br><b>5.</b> 같은 싸움이 세 번 반복되면 감정이 아니라 규칙을 바꾸기.`
          : `언니가 마지막으로 둘한테 약속 다섯 개만 남겨줄게.<br><br><b>1.</b> 서운한 건 너무 오래 묵히지 않기.<br><b>2.</b> 싸운 날 “우리 원래 안 맞아”까지 가지 않기.<br><b>3.</b> 연락·돈·혼자 있는 시간은 미리 기준 맞추기.<br><b>4.</b> 너한테 필요한 <b>${myNeed}</b>과 ${safeName}에게 필요한 <b>${partnerNeed}</b>을 서로 존중하기.<br><b>5.</b> 같은 싸움이 반복되면 사랑을 의심하기 전에 둘의 방식부터 바꿔보기.<br><br>궁합은 둘 사이를 결정하는 판정표라기보다, 잘 맞는 부분은 더 잘 쓰고 부딪히는 부분은 덜 다치게 만드는 지도처럼 봐주면 돼.`
      },
    ];

    const summary = `<div data-export-intro="compat" style="padding:15px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;margin-bottom:10px"><div style="font-size:11px;font-weight:900;color:#c2410c;margin-bottom:6px">우리 둘 궁합 · 16개 챕터</div><div style="font-size:13px;line-height:1.85;color:#7c2d12">${intro}</div></div>`;
    const pairCard = `<div data-export-pair="compat" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 6px"><div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e2e8f0"><div style="font-size:10px;font-weight:900;color:#94a3b8">나</div><div style="font-size:12px;font-weight:900;color:#0f172a;margin-top:4px">${esc(myDom)}</div></div><div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e2e8f0"><div style="font-size:10px;font-weight:900;color:#94a3b8">${safeName}</div><div style="font-size:12px;font-weight:900;color:#0f172a;margin-top:4px">${esc(partnerDom)}</div></div></div>`;
    return summary + pairCard + cards.map((s, index) => `<section data-export-kind="compat" data-export-index="${index}" style="padding:18px 0;border-bottom:1px solid #eef2f7"><h4 style="font-size:15px;font-weight:950;margin:0 0 8px;color:#0f172a">${s.title}</h4><div style="font-size:13px;line-height:1.9;color:#475569">${s.body}</div></section>`).join("");
  }


  function cloneForExport(node) {
    if (!node) return null;
    const copy = node.cloneNode(true);
    copy.removeAttribute?.("id");
    copy.querySelectorAll?.("[id]").forEach((el) => el.removeAttribute("id"));
    copy.style.maxWidth = "none";
    return copy;
  }

  function exportGroup(title, subtitle, nodes, slug) {
    return {
      title,
      subtitle,
      slug,
      nodes: (nodes || []).filter(Boolean),
    };
  }

  function buildPaidExportGroups(productId, body) {
    const groups = [];

    if (productId === "full_saju" || productId === "all_in_one") {
      const full = [...body.querySelectorAll('[data-export-kind="full"]')];
      const intro = body.querySelector('[data-export-intro="full"]');
      const fullTitles = [
        ["1장 · 나를 이해하는 법", "기본 성향 · 겉과 속 · 강점", "01_나를_이해하는_법"],
        ["2장 · 지치고 결정하고 일하는 법", "과부하 · 결정 · 일", "02_일하고_결정하는_법"],
        ["3장 · 돈·연애·사람", "돈 · 사랑 · 관계", "03_돈_연애_사람"],
        ["4장 · 회복하고 앞으로 가는 법", "회복 · 변화 · 평생 사용법", "04_회복과_사용법"],
      ];
      for (let i = 0; i < 4; i++) {
        const chunk = full.slice(i * 3, i * 3 + 3);
        if (!chunk.length) continue;
        const extra = i === 0 && intro ? [intro] : [];
        groups.push(exportGroup(
          fullTitles[i][0],
          fullTitles[i][1],
          [...extra, ...chunk],
          fullTitles[i][2],
        ));
      }
    }

    if (productId === "compatibility") {
      const sections = [...body.querySelectorAll('[data-export-kind="compat"]')];
      const intro = body.querySelector('[data-export-intro="compat"]');
      const pair = body.querySelector('[data-export-pair="compat"]');
      const titles = [
        ["1장 · 우리는 왜 끌릴까", "첫인상 · 나의 연애 방식 · 상대의 연애 방식", "01_우리는_왜_끌릴까"],
        ["2장 · 대화하고 싸우고 화해하는 법", "대화 · 서운함 · 갈등 · 화해", "02_대화_갈등_화해"],
        ["3장 · 애정표현·연락·생활·돈", "현실에서 자주 부딪히는 부분", "03_연락_생활_돈"],
        ["4장 · 경계와 오래 가는 법", "사생활 · 장기 강점 · 위험신호 · 약속", "04_오래_가는_법"],
      ];
      for (let i = 0; i < 4; i++) {
        const chunk = sections.slice(i * 4, i * 4 + 4);
        if (!chunk.length) continue;
        const extra = i === 0 ? [intro, pair].filter(Boolean) : [];
        groups.push(exportGroup(
          titles[i][0],
          titles[i][1],
          [...extra, ...chunk],
          titles[i][2],
        ));
      }
    }

    if (productId === "concern_bundle3" || productId === "all_in_one") {
      const concernSections = [...body.querySelectorAll('[data-export-kind="concern"]')];
      concernSections.forEach((section, concernIndex) => {
        const key = section.getAttribute("data-concern") || "";
        const label = CONCERNS[key] || section.querySelector("h3")?.textContent?.trim() || "고민";
        const articles = [...section.querySelectorAll("article")];
        const halves = [
          {
            title: `${label} · 나를 이해하기`,
            subtitle: "핵심 성향 · 반복 패턴 · 내가 잘못 짚는 부분",
            nodes: articles.slice(0, 3),
            suffix: "01_나를_이해하기",
          },
          {
            title: `${label} · 어떻게 움직일지`,
            subtitle: "실제 처방 · 맞는 사람/환경 · 움직일 시기",
            nodes: articles.slice(3, 6),
            suffix: "02_어떻게_움직일지",
          },
        ];
        halves.forEach((half) => {
          if (!half.nodes.length) return;
          groups.push(exportGroup(
            half.title,
            half.subtitle,
            half.nodes,
            `${String(concernIndex + 1).padStart(2, "0")}_${key || "concern"}_${half.suffix}`,
          ));
        });
      });
    }

    if (!groups.length) {
      groups.push(exportGroup(
        PRODUCTS[productId]?.name || "전체 결과",
        "전체 결과",
        [body],
        "01_전체결과",
      ));
    }
    return groups;
  }

  function buildPaidExportPage(product, group, index, total) {
    const page = document.createElement("div");
    page.style.cssText = "position:fixed;left:-12000px;top:0;width:480px;max-width:none;background:#fff;color:#0f172a;padding:26px 24px 32px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Pretendard','Segoe UI',sans-serif;contain:layout style";
    page.innerHTML = `
      <div style="padding-bottom:16px;margin-bottom:12px;border-bottom:1px solid #e2e8f0">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div style="font-size:12px;font-weight:950;color:#f43f5e">어떤언니 · ${esc(product?.name || "내 리포트")}</div>
          <div style="font-size:10px;font-weight:900;color:#94a3b8">${index + 1} / ${total}</div>
        </div>
        <div style="font-size:23px;line-height:1.28;font-weight:950;letter-spacing:-.04em;color:#0f172a;margin-top:8px">${esc(group.title)}</div>
        <div style="font-size:11px;line-height:1.6;font-weight:800;color:#94a3b8;margin-top:5px">${esc(group.subtitle || "")}</div>
      </div>
      <div data-export-page-body></div>
    `;
    const slot = page.querySelector("[data-export-page-body]");
    group.nodes.forEach((node) => {
      const copy = cloneForExport(node);
      if (copy) slot.appendChild(copy);
    });
    document.body.appendChild(page);
    return page;
  }

  function safeFilePart(value) {
    return String(value || "")
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 70);
  }

  async function saveFullPaidReport(root, productId) {
    const exporter = global.__UNNI_IMAGE_EXPORT_V2__;
    const body = root?.querySelector("#unniProductBody");
    const product = PRODUCTS[productId];
    if (!body || !exporter?.renderElementToPngBlob) {
      if (typeof showToast === "function") showToast("이미지 저장 기능을 불러오지 못했어.");
      return;
    }

    const button = root.querySelector("#unniProductSaveAll");
    const originalText = button?.textContent || "";
    if (button) {
      button.disabled = true;
      button.textContent = "보기 편하게 나누는 중…";
      button.style.opacity = ".65";
    }

    const pages = [];
    try {
      const groups = buildPaidExportGroups(productId, body);
      const blobs = [];
      const filenames = [];

      for (let index = 0; index < groups.length; index++) {
        const group = groups[index];
        const page = buildPaidExportPage(product, group, index, groups.length);
        pages.push(page);
        if (document.fonts?.ready) {
          try { await document.fonts.ready; } catch (_) {}
        }
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        const blob = await exporter.renderElementToPngBlob(page, 900);
        if (!blob || blob.size < 1000) throw new Error("PAID_EXPORT_EMPTY");
        blobs.push(blob);
        filenames.push(
          `어떤언니_${safeFilePart(product?.name || "리포트")}_${safeFilePart(group.slug || group.title)}.png`,
        );
      }

      if (blobs.length === 1) {
        const blob = blobs[0];
        if (exporter.isKakaoInApp?.()) {
          await exporter.showImageSaveFallback(blob, "save");
        } else if (exporter.isIOSDevice?.()) {
          const shared = await exporter.nativeSharePng(
            blob,
            filenames[0],
            product?.name || "어떤언니 리포트",
          );
          if (!shared) await exporter.showImageSaveFallback(blob, "save");
        } else {
          exporter.downloadPngBlob(blob, filenames[0]);
          if (typeof showToast === "function") showToast("전체 결과를 사진으로 저장했어.");
        }
      } else if (exporter.isKakaoInApp?.()) {
        await exporter.showImagePagesFallback(
          blobs,
          `${product?.name || "내 리포트"} · 보기 편하게 나눠뒀어`,
        );
      } else if (exporter.isIOSDevice?.()) {
        const shared = await exporter.nativeSharePngFiles(
          blobs,
          filenames,
          product?.name || "어떤언니 리포트",
        );
        if (!shared) {
          await exporter.showImagePagesFallback(
            blobs,
            `${product?.name || "내 리포트"} · 보기 편하게 나눠뒀어`,
          );
        }
      } else {
        blobs.forEach((blob, index) => {
          setTimeout(
            () => exporter.downloadPngBlob(blob, filenames[index]),
            index * 140,
          );
        });
        if (typeof showToast === "function") {
          showToast(`주제별로 ${blobs.length}장 나눠서 저장했어.`);
        }
      }
    } catch (error) {
      console.error("유료 리포트 전체 저장 실패:", error);
      if (typeof showToast === "function") {
        showToast("전체 결과 저장이 잠깐 꼬였어. 한 번만 다시 눌러줘.");
      }
    } finally {
      pages.forEach((page) => page.remove());
      if (button) {
        button.disabled = false;
        button.textContent = originalText || "전체 결과 사진으로 저장하기";
        button.style.opacity = "1";
      }
    }
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
    root.innerHTML = `<div style="max-width:520px;margin:4vh auto;background:#fff;border-radius:24px;padding:20px;box-shadow:0 24px 70px rgba(15,23,42,.25)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div id="unniProductBadge" style="font-size:11px;font-weight:900;color:#f43f5e"></div><h2 id="unniProductTitle" style="font-size:21px;font-weight:950;margin:5px 0 4px"></h2><div id="unniProductPrice" style="font-size:13px;font-weight:800;color:#64748b"></div></div><button id="unniProductClose" style="border:0;background:#f1f5f9;border-radius:999px;width:34px;height:34px;font-size:18px;cursor:pointer">×</button></div><div id="unniProductSetup" style="margin-top:16px"></div><div id="unniProductPayment" style="display:none;margin-top:15px"><div id="unniProductPaymentMethod"></div><div id="unniProductPaymentAgreement"></div></div><div id="unniProductBody" style="margin-top:14px"></div><button id="unniProductSaveAll" type="button" style="display:none;width:100%;margin-top:22px;border:0;border-radius:15px;background:linear-gradient(90deg,#fb7185,#f472b6);color:white;padding:14px 16px;font-size:13px;font-weight:950;cursor:pointer">전체 결과 사진으로 저장하기</button><button id="unniProductAction" style="width:100%;margin-top:18px;border:0;border-radius:15px;background:#0f172a;color:white;padding:14px 16px;font-size:14px;font-weight:900;cursor:pointer"></button><div id="unniProductAccessNote" style="display:none;margin-top:9px;text-align:center;font-size:11px;font-weight:800;line-height:1.6;color:#a16207">🔐 한 번 결제하면 이 브라우저에서는 추가 결제 없이 계속 다시 볼 수 있어요.</div></div>`;
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
      const hourOpts = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}시</option>`).join("");
      const minuteOpts = Array.from({ length: 60 }, (_, i) => `<option value="${String(i).padStart(2, "0")}">${String(i).padStart(2, "0")}분</option>`).join("");
      return `<div style="display:grid;gap:10px">
        <div><div style="font-size:11px;font-weight:900;color:#475569;margin:0 0 5px">상대 이름</div><input id="partnerName" placeholder="이름 또는 별명" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #e2e8f0;border-radius:12px"></div>
        <div><div style="font-size:11px;font-weight:900;color:#475569;margin:0 0 5px">상대 생년월일</div><input id="partnerBirth" inputmode="numeric" maxlength="8" placeholder="예: 1999년 2월 14일 → 19990214" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #e2e8f0;border-radius:12px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><select id="partnerGender" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="female">여성</option><option value="male">남성</option></select><select id="partnerCalendar" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="solar">양력 생일</option><option value="lunar">음력 생일</option></select></div>
        <div style="padding:12px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:900;color:#334155;margin-bottom:7px">상대가 태어난 시간 <span style="font-weight:700;color:#94a3b8">(알면 선택)</span></div>
          <div style="display:grid;grid-template-columns:.9fr 1fr 1fr;gap:6px">
            <select id="partnerAmpm" style="padding:10px 8px;border:1px solid #cbd5e1;border-radius:10px;background:white"><option value="">오전/오후</option><option value="am">오전</option><option value="pm">오후</option></select>
            <select id="partnerHour12" style="padding:10px 8px;border:1px solid #cbd5e1;border-radius:10px;background:white"><option value="">몇 시</option>${hourOpts}</select>
            <select id="partnerMinute" style="padding:10px 8px;border:1px solid #cbd5e1;border-radius:10px;background:white"><option value="">몇 분</option>${minuteOpts}</select>
          </div>
          <label style="display:flex;align-items:center;gap:7px;margin-top:9px;font-size:11px;font-weight:800;color:#64748b;cursor:pointer"><input id="partnerTimeUnknown" type="checkbox"> 태어난 시간을 몰라요</label>
          <div style="font-size:10px;line-height:1.5;color:#94a3b8;margin-top:6px">예: 오후 3시 20분이면 ‘오후 · 3시 · 20분’만 고르면 돼.</div>
        </div>
      </div>`;
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
      const unknown = !!root.querySelector("#partnerTimeUnknown")?.checked;
      let tRaw = "unknown";
      if (!unknown) {
        const ampm = root.querySelector("#partnerAmpm")?.value || "";
        const hour12 = Number(root.querySelector("#partnerHour12")?.value || 0);
        const minute = root.querySelector("#partnerMinute")?.value || "";
        if (!ampm || !hour12 || minute === "") throw new Error("상대 태어난 시간을 골라줘. 모르면 ‘태어난 시간을 몰라요’를 체크해줘.");
        const hour24 = (hour12 % 12) + (ampm === "pm" ? 12 : 0);
        tRaw = `${String(hour24).padStart(2, "0")}:${minute}`;
      }
      return { partner: { n: root.querySelector("#partnerName")?.value.trim() || "상대", b, t: tRaw, g: root.querySelector("#partnerGender")?.value || "female", c: root.querySelector("#partnerCalendar")?.value || "solar", l: false } };
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
    const saveAll = root.querySelector("#unniProductSaveAll");
    if (saveAll) {
      saveAll.style.display = "block";
      saveAll.textContent = "전체 결과 사진으로 저장하기";
      saveAll.onclick = () => saveFullPaidReport(root, productId);
    }
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
        const base = (location.hostname === "sajuft.com" || location.hostname === "www.sajuft.com" ? "https://sajuft.com" : location.origin) + location.pathname;
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
    const saveAll = root.querySelector("#unniProductSaveAll");
    if (saveAll) { saveAll.style.display = "none"; saveAll.onclick = null; }
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
