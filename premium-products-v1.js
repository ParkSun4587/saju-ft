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
      desc: "기본 성향부터 돈·일·연애·관계·회복·앞으로의 흐름까지 한 번에 연결해서 봐.",
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
    const need = p.elements?.primaryBehavior?.verb || "한 번에 하나씩 방향을 잡는 것";
    const avoid = p.elements?.avoidBehavior?.verb || "한쪽 방식만 과하게 쓰는 것";
    const climate = p.balance?.climateHuman || "속도를 조절하면서 현실 반응을 확인하는 쪽";
    const weakStat = p.behavior?.weakStatHuman || "내가 실제로 소모되는 지점을 확인하는 것";
    const relation = p.relations?.hasClash
      ? (isT ? "관계 변수가 겹치면 한 번에 방향을 뒤집기 쉽다. 중간 확인을 넣어." : "사람 일이 한꺼번에 겹치면 참다가 마음이 확 돌아설 수 있어. 작은 불편함부터 말해줘.")
      : (isT ? "큰 충돌보다 작은 불편함을 오래 미루는 게 손실이 된다." : "큰 싸움보다 작은 불편함을 오래 참는 쪽이 더 지치게 만들 수 있어.");

    return [
      { title: "01 · 너라는 사람의 중심", body: isT ? `기본 반응은 <b>${dom}</b>${second ? `, 그다음엔 ${second}` : ""} 쪽이야. ${strengthCopy(p, true)} 실제 힘은 ${strong}에 더 익숙하고, ${weak}은 의식적으로 챙겨야 해.` : `언니가 너를 길게 보고 나면 제일 먼저 보이는 건 <b>${dom}</b>${second ? `, 그리고 그 안의 ${second}` : ""}이야. ${strengthCopy(p, false)} ${strong}은 자연스럽게 나오지만 ${weak}은 네가 일부러 챙겨줄수록 삶이 덜 버거워져.` },
      { title: "02 · 돈이 움직이는 방식", body: isT ? `돈은 운 좋게 들어오는 순간보다 네 선택 기준이 더 중요해. 특히 <b>${weakStat}</b>을 먼저 잡고, 수입·가격·지출을 감정이 아니라 숫자로 확인해. 네 쪽에서 필요한 방향은 ${need}이야.` : `돈 문제에서 네가 더 열심히 벌어야 한다고만 생각하지 않았으면 좋겠어. <b>${weakStat}</b>부터 챙기고, 돈이 들어오고 나가는 순간에 네 마음이 어떻게 움직이는지 같이 봐야 해. 특히 ${need}을 해줄 때 돈 때문에 흔들리는 폭이 줄어.` },
      { title: "03 · 일에서 힘을 쓰는 방식", body: isT ? `${dom}이 일에서 장점으로 쓰이면 책임·결과·기준이 선명해진다. 다만 ${avoid}만 반복하면 강점도 병목이 된다. 준비와 실제 외부 반응을 분리해서 봐.` : `${dom}이 네 일의 힘으로 잘 쓰이면 남들이 쉽게 못 버티는 지점에서도 네 몫을 해내는 편이야. 다만 ${avoid}만 계속하면 잘하고도 지칠 수 있어. 네가 한 걸 밖으로 보여주고 반응받는 과정까지 일이라고 생각해줘.` },
      { title: "04 · 연애에서 사랑하는 방식", body: isT ? `연애에선 상대 분석보다 확인 속도가 중요하다. ${relation} 말과 행동이 일치하는지, 경계를 말했을 때 조정하는지를 봐.` : `연애할 때 네 마음만 보면 안 되고, 상대 곁에서 네가 어떤 사람이 되는지도 봐야 해. ${relation} 사랑받으려고 네 감정까지 설명해주고 참아줄 필요는 없어.` },
      { title: "05 · 사람을 남기는 기준", body: isT ? `사람 수보다 네 기준을 지켜주는 관계가 중요해. 편안함은 느낌 하나가 아니라 약속, 경계, 반복 행동으로 확인해. ${relation}` : `네 편은 네가 더 잘해야만 남는 사람이 아니야. 네 속도와 선을 말했을 때도 관계가 편안한 사람이 오래 둘 사람이야. ${relation}` },
      { title: "06 · 회복하고 다시 가는 방식", body: isT ? `회복도 일정이다. 네 흐름에는 <b>${climate}</b>이 맞아. 지쳤을 때 의지를 더 넣기보다 ${need}을 먼저 실행해.` : `너한테 쉬는 건 멈추는 게 아니라 다시 네 리듬을 찾는 시간이야. <b>${climate}</b>으로 움직일 때 덜 소모돼. 특히 ${need}을 작은 습관으로 만들어줘.` },
      { title: "07 · 앞으로 움직일 때", body: isT ? `좋은 시기라도 전부 같은 용도로 쓰지 마. 첫 구간은 테스트, 다음 구간은 확정처럼 단계별로 써. ${avoid}을 과하게 반복하지 않는 게 핵심이야.` : `앞으로 좋은 흐름이 와도 한 번에 인생을 뒤집으려 하지 않아도 돼. 먼저 작게 움직여 반응을 보고, 다음 흐름에서 진짜 남길 걸 고르면 돼. ${avoid}만 계속하지 않는 게 중요해.` },
    ];
  }

  function noteCards(notes) {
    return (notes || []).map((n) => `<article style="padding:16px 0;border-bottom:1px solid #eef2f7"><div style="font-size:11px;font-weight:900;color:#f43f5e;margin-bottom:7px">${esc(n.badge || n.themeNum || "NOTE")}</div><h4 style="font-size:16px;font-weight:900;line-height:1.45;margin:0 0 9px">${n.title || ""}</h4><div style="font-size:13px;line-height:1.8;color:#475569">${n.desc || ""}</div>${n.checklist ? `<div style="margin-top:11px;padding:10px 12px;border-radius:12px;background:#f8fafc;font-size:12px;line-height:1.6;color:#334155"><b>이번에 해볼 것</b><br>${esc(n.checklist)}</div>` : ""}</article>`).join("");
  }

  function fullSajuHtml(data, mode) {
    return fullSajuSections(data, mode).map((s) => `<section style="padding:16px 0;border-bottom:1px solid #eef2f7"><h4 style="font-size:15px;font-weight:900;margin:0 0 8px">${s.title}</h4><div style="font-size:13px;line-height:1.8;color:#475569">${s.body}</div></section>`).join("");
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
    let otherP = null;
    if (typeof global.buildIntegratedSajuProfile === "function") {
      try { otherP = global.buildIntegratedSajuProfile(partner); } catch (_) {}
    }
    const myNeed = myP?.elements?.primaryBehavior?.verb || "내 기준을 먼저 확인하는 것";
    const otherNeed = otherP?.elements?.primaryBehavior?.verb || "상대가 자기 속도로 판단할 시간을 주는 것";
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
    root.innerHTML = `<div style="max-width:520px;margin:4vh auto;background:#fff;border-radius:24px;padding:20px;box-shadow:0 24px 70px rgba(15,23,42,.25)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div id="unniProductBadge" style="font-size:11px;font-weight:900;color:#f43f5e"></div><h2 id="unniProductTitle" style="font-size:21px;font-weight:950;margin:5px 0 4px"></h2><div id="unniProductPrice" style="font-size:13px;font-weight:800;color:#64748b"></div></div><button id="unniProductClose" style="border:0;background:#f1f5f9;border-radius:999px;width:34px;height:34px;font-size:18px;cursor:pointer">×</button></div><div id="unniProductSetup" style="margin-top:16px"></div><div id="unniProductPayment" style="display:none;margin-top:15px"><div id="unniProductPaymentMethod"></div><div id="unniProductPaymentAgreement"></div></div><div id="unniProductBody" style="margin-top:14px"></div><button id="unniProductAction" style="width:100%;margin-top:18px;border:0;border-radius:15px;background:#0f172a;color:white;padding:14px 16px;font-size:14px;font-weight:900;cursor:pointer"></button></div>`;
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
      action.textContent = (typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE) ? "무료 이벤트로 미리보기" : `${won(product.price)}에 열기`;
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
