from pathlib import Path


def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, got {n}")
    return text.replace(old, new, 1)


# -----------------------------------------------------------------------------
# index.html: dedicated NOTE 03 blind-spot builder + integration
# -----------------------------------------------------------------------------
p = Path("index.html")
s = p.read_text(encoding="utf-8")

marker = "function generateConcernNotes(data, mode) {"
function_code = r'''function buildNoteThreeBlindSpot(
  data,
  concernKey,
  concernLabel,
  isT,
) {
  const profile = data?.analysisProfile || {};
  const dayMaster = profile.dayMaster || {};
  const structure = profile.structure || {};
  const classical = profile.classical || {};
  const stats = data?.stats || profile.stats || {};

  const safe = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[ch]);

  let lowest = null;
  try {
    lowest = getLowestStatInfo({
      wealth: Number(stats.wealth) || 0,
      mental: Number(stats.mental) || 0,
      drive: Number(stats.drive) || 0,
      network: Number(stats.network) || 0,
    });
  } catch (_) {}
  if (!lowest) {
    const fallback = [
      { type: "wealth", name: "돈 냄새 맡는 촉", score: Number(stats.wealth) || 0 },
      { type: "mental", name: "멘탈 방어력", score: Number(stats.mental) || 0 },
      { type: "drive", name: "기회 포착력", score: Number(stats.drive) || 0 },
      { type: "network", name: "인생 역전 귀인복", score: Number(stats.network) || 0 },
    ];
    fallback.sort((a, b) => a.score - b.score);
    lowest = fallback[0];
  }

  const patterns = {
    money: {
      T: {
        title: "돈이 안 모이는 이유, 수입보다 먼저 새는 구멍",
        assumed: "돈이 부족한 건 결국 수입이 작거나 운이 아직 안 터져서라고 보기 쉬워.",
        actual: "그런데 네 원국에서 먼저 확인할 건 큰 한 방보다 반복되는 작은 판단이야. 스트레스 받을 때 기준 없는 결제, 기회가 보일 때 조급한 선택, 손해를 인정하기 싫어 미루는 행동이 누적되면 수입이 늘어도 체감은 그대로일 수 있어.",
        rule: "이번 주 지출 중 '필요해서 쓴 돈'과 '감정 때문에 쓴 돈'을 딱 두 칸으로 나눠 기록하기",
      },
      F: {
        title: "텅장의 원인이 '내가 못 벌어서'만은 아닌 이유",
        assumed: "돈 걱정이 생기면 내가 능력이 부족해서, 더 못 벌어서 그런가 하고 나부터 탓하기 쉬워.",
        actual: "실제로는 마음의 안전을 돈으로 대신 사는 순간이 더 큰 누수가 될 수 있어. 관계를 어색하게 만들기 싫어 대신 내거나, 지친 날 나를 달래려고 쓰거나, 거절하기 미안해서 내 몫보다 더 부담하는 식이야.",
        rule: "돈이 나가기 직전에 '이건 필요 비용인지, 미안함·불안 비용인지' 한 번만 구분하기",
      },
    },
    career: {
      T: {
        title: "회사 탓보다 더 오래 발목 잡는 커리어 누수",
        assumed: "환경이 별로거나 제대로 된 기회가 안 와서 커리어가 막힌다고 느끼기 쉬워.",
        actual: "하지만 실제 누수는 성과를 밖으로 꺼내는 시점에서 생기기 쉬워. 준비가 더 필요하다는 이유로 지원·포트폴리오 공개·연봉 협상을 늦추면 실력은 쌓이는데 시장에서 확인되는 값은 그대로 남아.",
        rule: "이번 주 안에 성과 하나를 숫자로 정리해서 이력서·포트폴리오에 실제로 반영하기",
      },
      F: {
        title: "능력 부족이 아니라 '내 몫을 말하지 못한 것'",
        assumed: "인정받지 못하면 내가 아직 부족해서 그런가 하고 더 열심히 해야 한다고 생각하기 쉬워.",
        actual: "그런데 네가 놓치기 쉬운 건 실력 자체보다 내 성과를 드러내고 요구하는 과정이야. 관계가 불편해질까 봐 공을 나누고, 부탁을 먼저 받아주고, 평가받는 순간엔 내 몫을 작게 말하면 계속 저평가될 수 있어.",
        rule: "이번 주 내가 만든 결과 3개를 적고, 그중 하나는 누구의 도움 없이 내가 한 몫을 분명하게 적기",
      },
    },
    love: {
      T: {
        title: "사람이 없는 게 아니라 확신을 기다리다 놓치는 지점",
        assumed: "괜찮은 사람이 없거나 상대가 애매해서 연애가 꼬인다고 보기 쉬워.",
        actual: "실제로는 마음이 생긴 뒤에도 안전하다는 확신을 너무 오래 확인하려는 쪽에서 누수가 생길 수 있어. 관심은 있는데 표현은 줄이고, 상대 반응을 테스트하고, 먼저 움직이면 손해 보는 것처럼 버티면 좋은 관계도 애매한 채 끝나기 쉬워.",
        rule: "호감 있는 사람에게 떠보기 대신 내가 원하는 반응이나 약속을 한 문장으로 직접 말하기",
      },
      F: {
        title: "상대의 온도보다 먼저 확인해야 할 내 연애 습관",
        assumed: "상대가 식었나, 내가 매력이 부족한가를 먼저 의심하기 쉬워.",
        actual: "그런데 더 자주 새는 곳은 상대 반응을 내 책임으로 번역하는 습관이야. 답장이 늦거나 표정이 달라지면 이유를 확인하기 전에 내 잘못부터 찾고, 불안을 없애려고 더 맞춰주면 관계의 균형이 점점 기울어져.",
        rule: "불안해졌을 때 추측 3개를 만들지 말고, 확인할 사실 1개만 직접 묻기",
      },
    },
    path: {
      T: {
        title: "길을 못 찾는 게 아니라 확신이 생길 때까지 멈춰 있는 것",
        assumed: "아직 나한테 딱 맞는 진로를 못 찾아서 출발을 못 한다고 생각하기 쉬워.",
        actual: "실제 누수는 선택보다 검증 단계에서 생겨. 완벽한 답을 머릿속에서 찾으려 오래 비교하면 정보는 늘어나도 내 데이터는 안 생겨. 작은 실전 결과가 없는 상태에서 고민만 길어지는 게 가장 비싼 비용이야.",
        rule: "고민 중인 방향 하나를 7일짜리 작은 실험으로 바꿔 실제 결과를 하나 만들기",
      },
      F: {
        title: "꿈이 현실적이지 않은 게 아니라 남의 안심을 먼저 챙긴 것",
        assumed: "내가 원하는 길이 불안정하거나 현실성이 부족해서 망설인다고 느끼기 쉬워.",
        actual: "하지만 실제로는 내 선택 때문에 주변이 걱정하거나 실망할까 봐 안전한 답을 먼저 고르는 순간에 방향이 흐려질 수 있어. 하고 싶은 것보다 설명하기 쉬운 것을 택하면 시간이 갈수록 마음과 현실이 따로 놀아.",
        rule: "누구에게도 설명할 필요가 없다면 하고 싶은 선택을 한 줄로 적고, 이번 주 30분만 그쪽에 쓰기",
      },
    },
    people: {
      T: {
        title: "사람 보는 눈보다 먼저 고쳐야 할 '늦은 경계선'",
        assumed: "이상한 사람이 자꾸 붙거나 주변에 피곤한 사람이 많아서 인간관계가 꼬인다고 느끼기 쉬워.",
        actual: "실제 누수는 사람을 잘못 고르는 순간보다 불편함을 느끼고도 초반에 선을 안 긋는 데서 생길 수 있어. 참을 만큼 참다가 한 번에 끊으면 매번 '또 이상한 사람을 만났다'는 결론만 남아.",
        rule: "이번 주 불편한 부탁 하나에는 즉답 대신 '확인하고 말할게'로 시간을 벌고 기준부터 확인하기",
      },
      F: {
        title: "내가 예민한 게 아니라 남의 감정까지 내 몫으로 들고 온 것",
        assumed: "관계에서 힘들면 내가 너무 예민하거나 사람을 편하게 못 대하는 탓이라고 생각하기 쉬워.",
        actual: "그런데 실제 누수는 상대 기분까지 내가 책임지려는 순간이야. 상대가 서운해할까 봐 거절을 미루고, 분위기가 나쁘면 내가 풀어야 할 것 같아 움직이면 관계가 많아질수록 내 에너지가 먼저 바닥나.",
        rule: "오늘 한 번은 상대가 실망할 가능성을 감수하고도 내 일정과 체력을 기준으로 대답하기",
      },
    },
    mental: {
      T: {
        title: "의지가 약한 게 아니라 회복 전에 또 밀어붙이는 구조",
        assumed: "집중이 깨지고 지치면 요즘 내가 나약해졌거나 의지가 부족해졌다고 보기 쉬워.",
        actual: "실제 누수는 회복 신호를 문제로 취급하고 계속 밀어붙이는 데서 생길 수 있어. 쉬는 동안에도 해결책을 찾고, 뒤처질까 불안해서 다시 일을 잡으면 몸은 멈춰도 머리는 계속 근무 중이야.",
        rule: "오늘 30분은 생산성 없는 휴식으로 비워두고 그 시간에 성과를 만들려는 행동을 금지하기",
      },
      F: {
        title: "멘탈이 약한 게 아니라 감정의 출처가 너무 많이 섞인 것",
        assumed: "마음이 자주 흔들리면 내가 유난이거나 멘탈이 약해서 그렇다고 생각하기 쉬워.",
        actual: "그런데 실제 누수는 내 감정과 남의 감정을 분리하지 못한 채 계속 받아들이는 데서 생길 수 있어. 누군가 힘들어하면 같이 가라앉고, 분위기가 차가우면 이유를 내 안에서 찾다 보면 쉬어도 피로가 남아.",
        rule: "오늘 불편했던 감정 하나를 '내 문제 / 남의 문제 / 아직 모름' 셋 중 하나로 분류하기",
      },
    },
  };

  const weaknessMap = {
    wealth: "손익과 내 몫을 숫자로 끊어 보는 지점",
    mental: "불편한 감정이 올라왔을 때 선을 긋고 회복하는 지점",
    drive: "생각을 실행으로 옮기고 타이밍을 잡는 지점",
    network: "혼자 버티지 않고 도움과 연결을 실제로 쓰는 지점",
  };
  const strengthMap = {
    신강: "버티는 힘이 강한 편이라 문제를 알아도 '이 정도는 괜찮다'며 늦게 끊기 쉽고,",
    신약: "주변 자극에 쓰는 에너지가 큰 편이라 핵심 행동보다 반응과 방어가 먼저 나오기 쉽고,",
    중화: "한쪽으로 크게 치우치진 않지만 상황에 맞추는 동안 내 기준이 흐려지면 결정이 늦어질 수 있고,",
  };
  const statusMap = {
    성격: "격의 흐름은 비교적 정리돼 있어서 능력 부족보다 장점을 잘못 쓰는 순간을 보는 게 중요해.",
    성중유패: "잘 풀리는 축과 걸리는 축이 함께 보여서 장점이 과해질 때 약점으로 뒤집히는 순간을 봐야 해.",
    파격: "걸림이 되는 축이 겉으로 드러나 있어 스트레스 상황에서 같은 약점이 반복되는지 확인할 가치가 커.",
    평격: "한 가지 공식으로 단순화하기보다 실제 생활에서 반복되는 선택 습관을 직접 확인하는 게 중요해.",
  };

  const selected = patterns[concernKey] || patterns.money;
  const pattern = isT ? selected.T : selected.F;
  const strength = dayMaster.strength || (data?.isDayMasterStrong ? "신강" : "신약");
  const gyeokName = structure.gyeokName || data?.gyeokguk?.name || "평격";
  const status = structure.status || data?.gyeokStatus?.status || "평격";
  const sangsin = structure.sangsin || data?.gyeokStatus?.sangsinFound || "";
  const gisin = structure.gisin || data?.gyeokStatus?.gisinFound || "";
  const weakPoint = weaknessMap[lowest.type] || "반복되는 선택을 끊는 지점";
  const scoreNum = Number(lowest.score);
  const scoreText = Number.isFinite(scoreNum) ? `${Math.round(scoreNum)}점` : "점수 확인 중";

  const jeokcheon = classical.jeokcheon || {};
  const supportForce = Number(jeokcheon.supportForce);
  const drainForce = Number(jeokcheon.drainForce);
  const balanceBasis =
    Number.isFinite(supportForce) && Number.isFinite(drainForce)
      ? `${strength} · 받치는 힘 ${supportForce.toFixed(1)} / 빠지는 힘 ${drainForce.toFixed(1)}`
      : `${strength} 균형 판정`;
  const qiongtong = classical.qiongtong || {};
  const climateBasis =
    qiongtong.direction || "계절의 한난조습이 극단적으로 치우치지 않은 편";
  const statusExtra = [sangsin ? `도움축 ${sangsin}` : "", gisin ? `걸림축 ${gisin}` : ""]
    .filter(Boolean)
    .join(" · ");

  const mechanism = `${strengthMap[strength] || "원국 전체 균형을 보면,"} ${statusMap[status] || statusMap.평격}`;
  const evidence = `<div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10.5px] leading-relaxed text-slate-600"><b class="text-slate-800">언니가 잡은 계산 근거</b><br>취약축: ${safe(lowest.name)} ${safe(scoreText)} · ${safe(gyeokName)} · ${safe(status)}${statusExtra ? ` · ${safe(statusExtra)}` : ""}<br>균형: ${safe(balanceBasis)}<br>계절 보정: ${safe(climateBasis)}<br><span class="text-[9.5px] text-slate-400">※ 고전 원리는 계산 기준으로 쓰고, 위 행동 패턴은 그 계산을 현대 생활에 맞춰 번역한 해석이야.</span></div>`;

  return {
    badge: `${concernLabel} · 블라인드스팟`,
    title: pattern.title,
    desc: `<b>내가 문제라고 느끼는 지점:</b> ${pattern.assumed}<br><br><b>실제로 새는 지점:</b> ${pattern.actual}<br><br><b>특히 약한 연결고리:</b> ${safe(weakPoint)}. ${mechanism}${evidence}`,
    checklist: pattern.rule,
  };
}

'''
s = replace_once(s, marker, function_code + marker, "insert NOTE3 builder")

note_two_anchor = '''const noteTwo = buildNoteTwoPattern(
  data,
  concernKey,
  concernLabel,
  isT,
);
'''
note_two_new = note_two_anchor + '''
const noteThree = buildNoteThreeBlindSpot(
  data,
  concernKey,
  concernLabel,
  isT,
);
'''
s = replace_once(s, note_two_anchor, note_two_new, "NOTE3 integration const")

old_note3 = '''          {
            themeNum: "03",
            badge: badges[2],
            title: titles[2],
            desc: `${source.flaw || ""}<br><br><b>숨은 누수:</b> ${source.leak || ""}`,
            checklist: isT
              ? "문제를 남 탓이나 운 탓으로 넘기지 말고 반복 패턴부터 차단하기"
              : "내가 왜 그렇게 행동했는지 먼저 이해하고 스스로를 몰아세우지 않기",
          },
'''
new_note3 = '''          {
            themeNum: "03",
            badge: noteThree.badge,
            title: noteThree.title,
            desc: noteThree.desc,
            checklist: noteThree.checklist,
          },
'''
s = replace_once(s, old_note3, new_note3, "replace NOTE3 object")
p.write_text(s, encoding="utf-8")


# -----------------------------------------------------------------------------
# Browser regression: NOTE3 must be grounded, integrated, varied, and safe.
# -----------------------------------------------------------------------------
p = Path("tests/pre_note3_browser_regression_v4.cjs")
s = p.read_text(encoding="utf-8")
s = replace_once(
    s,
    '''    typeof buildNoteTwoPattern === 'function' &&
    typeof analyzeDayMasterStrengthV2 === 'function',
''',
    '''    typeof buildNoteTwoPattern === 'function' &&
    typeof buildNoteThreeBlindSpot === 'function' &&
    typeof analyzeDayMasterStrengthV2 === 'function',
''',
    "browser load NOTE3",
)

core_insert_anchor = '''    console.log('CORE_PASS', JSON.stringify(r));
    await page.close();
  }

  // B. Explicitly find a 中和 chart and ensure NOTE 1/2 no longer treat it as 신약.
'''
core_insert_new = '''    console.log('CORE_PASS', JSON.stringify(r));

    const note3Audit = await page.evaluate(() => {
      const labels = { money:'재물·돈복', career:'학업·커리어', love:'연애·썸', path:'진로·미래', people:'인간관계', mental:'번아웃·멘탈' };
      const base = calculateAccurateManse(1998,2,21,'03:10','male');
      const data = { ...base, concernKey:'money' };
      const out = [];
      for (const key of Object.keys(labels)) {
        for (const mode of ['F','T']) {
          const n = buildNoteThreeBlindSpot(data, key, labels[key], mode === 'T');
          out.push({ key, mode, title:n.title, badge:n.badge, desc:n.desc, checklist:n.checklist });
        }
      }
      return out;
    });
    assert(note3Audit.length === 12, `NOTE3 audit count ${note3Audit.length}`);
    assert(new Set(note3Audit.map(x => x.title)).size === 12, 'NOTE3 titles are not concern/mode specific');
    for (const n of note3Audit) {
      assert(!!n.title && !!n.badge && !!n.desc && !!n.checklist, `NOTE3 empty field ${n.key}/${n.mode}`);
      assert(n.desc.includes('내가 문제라고 느끼는 지점:'), `NOTE3 assumed-problem missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('실제로 새는 지점:'), `NOTE3 actual-leak missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('특히 약한 연결고리:'), `NOTE3 weak-link missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('언니가 잡은 계산 근거'), `NOTE3 evidence missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('취약축:'), `NOTE3 vulnerable-axis missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('균형:'), `NOTE3 balance evidence missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('계절 보정:'), `NOTE3 climate evidence missing ${n.key}/${n.mode}`);
      assert(!/(undefined|NaN|null)/.test(`${n.title}${n.badge}${n.desc}${n.checklist}`), `NOTE3 bad token ${n.key}/${n.mode}`);
      assert(!n.desc.includes('적천수가 말하길') && !n.desc.includes('궁통보감이 말하길'), `NOTE3 overclaims classical source ${n.key}/${n.mode}`);
    }
    for (const key of ['money','career','love','path','people','mental']) {
      const f = note3Audit.find(x => x.key===key && x.mode==='F');
      const t = note3Audit.find(x => x.key===key && x.mode==='T');
      assert(f.desc !== t.desc, `NOTE3 F/T collapsed ${key}`);
    }
    console.log('NOTE3_AUDIT_PASS', JSON.stringify(note3Audit.map(x => ({key:x.key,mode:x.mode,title:x.title}))));
    await page.close();
  }

  // B. Explicitly find a 中和 chart and ensure NOTE 1/2 no longer treat it as 신약.
'''
s = replace_once(s, core_insert_anchor, core_insert_new, "browser NOTE3 12-way audit")

ui_anchor = '''      const n2 = buildNoteTwoPattern(data, c.concern, labels[c.concern], c.mode === 'T');
      const generated = JSON.stringify([notes,n1,n2]);
'''
ui_new = '''      const n2 = buildNoteTwoPattern(data, c.concern, labels[c.concern], c.mode === 'T');
      const n3 = buildNoteThreeBlindSpot(data, c.concern, labels[c.concern], c.mode === 'T');
      const generated = JSON.stringify([notes,n1,n2,n3]);
'''
s = replace_once(s, ui_anchor, ui_new, "browser NOTE3 UI call")

report_anchor = '''        note2Valid:!!(n2?.title && n2?.desc && n2?.checklist && n2.desc.includes('1. 시작 신호') && n2.desc.includes('왜 반복되냐면')),
        note6Valid:!!(notes?.[5]?.desc && notes[5].desc.includes('2026') && notes[5].desc.includes('2027')),
'''
report_new = '''        note2Valid:!!(n2?.title && n2?.desc && n2?.checklist && n2.desc.includes('1. 시작 신호') && n2.desc.includes('왜 반복되냐면')),
        note3Valid:!!(n3?.title && n3?.desc && n3?.checklist && n3.desc.includes('내가 문제라고 느끼는 지점:') && n3.desc.includes('실제로 새는 지점:') && n3.desc.includes('언니가 잡은 계산 근거')),
        note3Integrated:!!(notes?.[2]?.title === n3.title && notes?.[2]?.desc === n3.desc && notes?.[2]?.checklist === n3.checklist),
        note6Valid:!!(notes?.[5]?.desc && notes[5].desc.includes('2026') && notes[5].desc.includes('2027')),
'''
s = replace_once(s, report_anchor, report_new, "browser NOTE3 UI report")

assert_anchor = '''    assert(report.note2Valid, `${c.id}: NOTE2 structure/reason block missing`);
    assert(report.note6Valid, `${c.id}: NOTE6 2026/2027 timeline missing`);
'''
assert_new = '''    assert(report.note2Valid, `${c.id}: NOTE2 structure/reason block missing`);
    assert(report.note3Valid, `${c.id}: NOTE3 blind-spot/evidence block missing`);
    assert(report.note3Integrated, `${c.id}: NOTE3 builder not integrated into generated notes`);
    assert(report.note6Valid, `${c.id}: NOTE6 2026/2027 timeline missing`);
'''
s = replace_once(s, assert_anchor, assert_new, "browser NOTE3 UI assertions")

p.write_text(s, encoding="utf-8")
print("NOTE3_PATCH_READY")
