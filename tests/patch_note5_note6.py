from pathlib import Path


def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, got {n}")
    return text.replace(old, new, 1)

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Keep timing windows on Korea civil date and retain the currently-active wolun period.
old_filter = '''      function filterFutureWolun(wolunList) {
        if (!wolunList) return wolunList;
        const todayYmd = new Date().toISOString().slice(0, 10);
        const future = wolunList.filter((w) => w.startYmd >= todayYmd);
        return future.length > 0 ? future : null;
      }'''
new_filter = '''      function getSeoulTodayYmd(now = new Date()) {
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(now);
        const bag = Object.fromEntries(
          parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
        );
        return `${bag.year}-${bag.month}-${bag.day}`;
      }
      function wolunEndYmd(w) {
        if (!w) return "";
        if (w.endYmd) return w.endYmd;
        if (w.endYear && w.endMonth && w.endDay) {
          return `${String(w.endYear).padStart(4, "0")}-${String(w.endMonth).padStart(2, "0")}-${String(w.endDay).padStart(2, "0")}`;
        }
        return w.startYmd || "";
      }
      function filterFutureWolun(wolunList) {
        if (!wolunList) return wolunList;
        const todayYmd = getSeoulTodayYmd();
        const futureOrActive = wolunList.filter((w) => {
          const endYmd = wolunEndYmd(w);
          return endYmd ? endYmd >= todayYmd : (w.startYmd || "") >= todayYmd;
        });
        return futureOrActive.length > 0 ? futureOrActive : null;
      }'''
s = replace_once(s, old_filter, new_filter, 'timing Seoul-date filter')

marker = 'function generateConcernNotes(data, mode) {'
if 'function buildNoteFiveEnvironmentFilter(' in s or 'function buildNoteSixTiming(' in s:
    raise SystemExit('NOTE5/6 builder already exists')

builders = r'''
function buildNoteFiveEnvironmentFilter(
  data,
  concernKey,
  concernLabel,
  isT,
) {
  const profile = data?.analysisProfile || {};
  const dayMaster = profile.dayMaster || {};
  const sipsin = profile.sipsin || {};
  const relations = profile.relations || {};

  const safe = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[ch]);

  const filters = {
    money: {
      T: {
        title: "돈 얘기할수록 더 차분해지는 사람이 네 편이야",
        ally: "수익 자랑보다 손실·조건·계약부터 같이 확인하고, 네가 안 한다고 해도 태도가 달라지지 않는 사람",
        villain: "마감·수익 인증·지인 찬스를 들이밀며 지금 안 하면 손해라고 조급하게 만드는 사람",
        place: "비용·역할·정산 기준이 말이 아니라 숫자와 기록으로 남는 환경",
        test: "돈 제안이 오면 '최악의 손실이 얼마야?'를 물어보고 답을 흐리면 바로 보류하기",
      },
      F: {
        title: "네가 돈을 안 써도 따뜻함이 그대로인 사람이 진짜 내 편",
        ally: "각자 계산해도 어색해하지 않고, 네 형편과 거절을 관계의 애정도와 연결하지 않는 사람",
        villain: "미안함과 정을 건드려 대신 내게 하거나, 네가 베푸는 걸 당연한 역할처럼 받는 사람",
        place: "돈을 쓰지 않아도 환대받고, 비용 기준을 편하게 말할 수 있는 환경",
        test: "이번 주 한 번은 먼저 계산하지 말고 각자 내자고 말한 뒤 상대 반응 보기",
      },
    },
    career: {
      T: {
        title: "좋은 상사는 응원보다 평가 기준을 먼저 보여준다",
        ally: "해야 할 일·마감·평가 기준을 분명히 말하고 결과가 좋으면 권한과 보상도 같이 키워주는 사람",
        villain: "기준은 계속 바꾸면서 열정과 충성만 요구하고, 잘하면 다음 잡무를 보상처럼 얹는 사람",
        place: "역할·권한·피드백이 구체적이고 성과를 외부에 보여줄 수 있는 환경",
        test: "새 일을 맡기 전 '완료 기준과 내 권한이 어디까지인지' 두 가지부터 확인하기",
      },
      F: {
        title: "네 성실함을 공짜 노동으로 쓰지 않는 곳이 맞는 자리야",
        ally: "네 수고를 알아보고 도움 요청이나 역할 조정을 무능력으로 취급하지 않는 사람",
        villain: "착하고 책임감 있다는 이유로 남의 몫까지 조용히 넘기고 고마움은 생략하는 사람",
        place: "내 몫과 남의 몫이 나뉘고, 힘들다고 말해도 관계가 깨지지 않는 환경",
        test: "이번 주 부탁 하나에는 바로 '네' 하지 말고 내 일정 확인 후 답하겠다고 말하기",
      },
    },
    love: {
      T: {
        title: "밀당 잘하는 사람보다 말과 행동이 맞는 사람이 맞아",
        ally: "애매한 질문을 피하지 않고 약속·연락·관계 의도를 행동으로 확인시켜 주는 사람",
        villain: "관심을 줬다 거뒀다 하며 네 반응을 시험하고, 직접 물으면 농담이나 회피로 빠지는 사람",
        place: "떠보기보다 확인 질문을 해도 자존심 싸움으로 번지지 않는 관계",
        test: "애매한 행동 하나를 해석하지 말고 한 문장으로 직접 물어본 뒤 답변의 명확성 보기",
      },
      F: {
        title: "서운하다고 말해도 사랑이 줄지 않는 사람이 맞는 인연",
        ally: "네 감정을 과하다고 평가하지 않고, 서운함을 말했을 때 설명하고 조율하려는 사람",
        villain: "불안을 만들어놓고 네가 더 맞춰주면 그때만 다정해지는 사람",
        place: "기분을 숨기지 않아도 안전하고 서로의 감정이 각자의 책임으로 존중되는 관계",
        test: "작은 서운함 하나를 숨기지 않고 말해본 뒤 상대가 방어하는지 조율하는지 보기",
      },
    },
    path: {
      T: {
        title: "정답 알려주는 사람보다 실험하게 해주는 사람이 귀인이야",
        ally: "네 선택을 대신 정하지 않고 작은 실험·결과·피드백으로 판단하게 도와주는 사람",
        villain: "자기 성공 공식을 정답처럼 강요하면서 네가 직접 해보기 전부터 가능성을 잘라내는 사람",
        place: "실패 비용이 작고 결과물을 빨리 만들어 실제 반응을 볼 수 있는 환경",
        test: "조언을 들으면 바로 따르지 말고 '7일 동안 뭘 시험해볼 수 있지?'로 바꿔보기",
      },
      F: {
        title: "걱정해도 네 선택권까지 가져가지 않는 사람이 내 편이야",
        ally: "현실적인 걱정은 말해도 마지막 선택은 네 몫으로 남겨두고 시도 자체를 응원하는 사람",
        villain: "실망·불안·안정이라는 말을 이용해 네가 원하는 방향을 포기하게 만드는 사람",
        place: "매번 허락받거나 설명하지 않아도 작은 도전을 해볼 수 있는 환경",
        test: "내가 원하는 선택을 먼저 말한 뒤 상대가 질문하는지 바로 반대부터 하는지 보기",
      },
    },
    people: {
      T: {
        title: "선을 말했을 때 고치는 사람이 남길 사람이다",
        ally: "불편하다고 말하면 변명보다 행동을 조정하고 같은 선을 두 번 넘지 않는 사람",
        villain: "농담이었다며 반복해서 선을 넘고 네가 예민하다는 말로 책임을 돌리는 사람",
        place: "거절·이견을 말해도 뒤끝이나 보복 없이 다시 일상으로 돌아오는 관계",
        test: "작은 경계선 하나를 먼저 말해보고 다음 행동이 실제로 달라지는지 확인하기",
      },
      F: {
        title: "네가 상대 기분을 관리하지 않아도 편한 사람이 귀인이야",
        ally: "자기 감정을 네게 쏟아놓고 해결까지 맡기지 않으며 네 상태도 같이 물어보는 사람",
        villain: "힘들 때마다 네게 감정을 배출하고 네가 거리를 두면 죄책감을 주는 사람",
        place: "침묵·거리·혼자 있는 시간을 설명하지 않아도 존중받는 관계",
        test: "오늘 한 번은 상대 기분을 풀어주려 움직이지 말고 내 상태부터 말해보기",
      },
    },
    mental: {
      T: {
        title: "더 몰아붙이는 사람보다 회복 시간을 지켜주는 사람이 필요해",
        ally: "문제가 생겼을 때 무조건 해결책부터 던지지 않고 네 일정과 회복 한계를 같이 지켜주는 사람",
        villain: "쉴 때마다 뒤처진다며 성과 비교와 생산성 압박을 계속 주는 사람",
        place: "알림·업무·대화를 끊고 완전히 쉬는 시간이 실제로 보장되는 환경",
        test: "회복 시간이 필요하다고 말했을 때 존중하는지 설득해서 다시 일시키는지 보기",
      },
      F: {
        title: "아무것도 해주지 않아도 곁에 남는 사람이 진짜 안식처야",
        ally: "네가 밝게 반응하지 않아도 서운해하지 않고 조용히 쉬게 두는 사람",
        villain: "자기 힘든 이야기를 반복해서 쏟으며 네가 받아줘야 관계가 유지되는 사람",
        place: "감정 노동을 하지 않아도 소속감을 잃지 않고 혼자 회복할 수 있는 환경",
        test: "컨디션이 낮은 날 억지로 맞장구치지 말고 쉬겠다고 말한 뒤 관계 온도 확인하기",
      },
    },
  };

  const needMap = {
    비견: "내 선택권과 독립성을 존중하는 관계",
    겁재: "비교와 경쟁으로 내 몫을 흔들지 않는 관계",
    식신: "내 페이스를 재촉하지 않는 관계",
    상관: "의견을 말해도 통제하거나 찍어누르지 않는 관계",
    정재: "약속과 기준이 자주 바뀌지 않는 관계",
    편재: "재미와 기회만큼 책임과 정산도 분명한 관계",
    정관: "신뢰와 역할 기준이 명확한 관계",
    편관: "실수했을 때 겁주기보다 해결에 집중하는 관계",
    정인: "설명과 이해를 충분히 주는 관계",
    편인: "숨은 의도를 떠보게 만들지 않는 투명한 관계",
  };
  const strengthMap = {
    신강: "버티는 힘이 강해 안 맞는 환경에서도 오래 남기 쉬우니 초반 기준이 특히 중요해.",
    신약: "주변 자극을 크게 받는 편이라 사람과 환경의 질이 컨디션에 직접 영향을 주기 쉬워.",
    중화: "상황 적응력은 괜찮지만 기준을 미리 정하지 않으면 분위기에 따라 선택이 달라질 수 있어.",
  };
  const yongMap = {
    mok: "새 시도를 막지 않고 성장 여지를 주는 환경",
    hwa: "표현과 피드백이 빠르게 오가는 환경",
    to: "약속·루틴·역할이 안정적으로 굳어 있는 환경",
    geum: "기준·경계·책임이 명확한 환경",
    su: "생각할 여백과 선택지를 충분히 주는 환경",
  };

  const pattern = (filters[concernKey] || filters.money)[isT ? "T" : "F"];
  const dominant = sipsin.dominant || "";
  const strength = dayMaster.strength || (data?.isDayMasterStrong ? "신강" : "신약");
  const need = needMap[dominant] || "내 기준을 존중하면서 말과 행동이 일치하는 관계";
  const yongGuide = yongMap[data?.yongshin] || "내가 과하게 소모되지 않고 기준을 지킬 수 있는 환경";
  const clashGuide = relations.hasChung
    ? "원국에 충이 보여 불편함을 오래 참으면 마지막 반응이 커질 수 있으니, 작은 선을 초반에 말하는 편이 좋아."
    : "큰 충돌보다 조용히 누적되는 쪽이라, 괜찮은 척 넘긴 횟수를 기준으로 관계를 점검하는 편이 좋아.";

  return {
    badge: `${concernLabel} 사람·환경 필터`,
    title: pattern.title,
    desc: `
      <div class="space-y-2">
        <div class="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
          <b class="text-emerald-800">내 편 신호</b><br>${safe(pattern.ally)}
        </div>
        <div class="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5">
          <b class="text-rose-700">거리 둘 신호</b><br>${safe(pattern.villain)}
        </div>
        <div class="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
          <b class="text-slate-900">잘 맞는 환경</b><br>${safe(pattern.place)}
        </div>
      </div>
      <div class="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10.5px] leading-relaxed text-slate-600">
        <b class="text-slate-800">왜 이런 필터가 맞나</b><br>
        ${dominant ? `<b>${safe(dominant)}</b> 기운이 두드러져 ` : "원국의 관계 반응을 보면 "}${safe(need)}가 중요해. ${safe(strengthMap[strength] || strengthMap.중화)}<br>
        보완축을 생활로 번역하면 <b>${safe(yongGuide)}</b>이 맞고, ${safe(clashGuide)}
      </div>
    `,
    checklist: pattern.test,
  };
}

function buildNoteSixTiming(
  data,
  concernKey,
  concernLabel,
  isT,
) {
  const safe = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[ch]);

  const timing = getTrueBaziTiming(
    data?.dayOheng || "to",
    concernKey,
    data?.userGender,
    data?.userBirthStr,
    data?.gyeokguk,
    data?.gyeokStatus,
    data?.realYeonun,
  );

  const titles = {
    money: {
      T: "돈은 운 좋은 달보다 '어떻게 움직일 달인지'가 더 중요해",
      F: "돈 때문에 조급해지지 않도록 2026-2027 흐름을 미리 잡아둘게",
    },
    career: {
      T: "지원·협상·이동을 아무 달에나 던지지 않는 2년 타이밍",
      F: "내 노력이 밖에서 인정받기 좋은 흐름을 미리 준비하는 2년",
    },
    love: {
      T: "애매한 인연에 시간 쓰지 않게 2026-2027 연애 흐름 정리",
      F: "마음을 서두르지 않아도 되게 2026-2027 인연 흐름을 짚어줄게",
    },
    path: {
      T: "진로를 확 뒤집기 전에 써먹을 2026-2027 실행 타이밍",
      F: "내 길을 조금씩 확인해가기 좋은 2026-2027 흐름",
    },
    people: {
      T: "사람을 늘릴 때와 정리할 때를 구분하는 2026-2027 흐름",
      F: "내 편은 남기고 소모되는 관계는 덜어낼 2026-2027 흐름",
    },
    mental: {
      T: "밀어붙일 때와 회복을 잠글 때를 나누는 2026-2027 리듬",
      F: "마음이 덜 흔들리도록 미리 보는 2026-2027 회복 리듬",
    },
  };

  const verdictLabel = {
    favorable: "받쳐주는 해",
    unfavorable: "방어가 필요한 해",
    neutral: "기본기 쌓는 해",
  };
  const momentumLabel = {
    strong: "집중 실행",
    mixed: "선별 실행",
    mild: "유지·준비",
    caution: "방어 우선",
    passed: "지난 구간",
  };
  const actions = {
    money: {
      strong: "수입·계약·부수입 기회는 숫자 검증 뒤 실행하고, 생긴 여유는 먼저 남겨.",
      mixed: "확실한 현금흐름만 잡고 장기 베팅이나 지인 돈거래는 작게 제한해.",
      mild: "수익 확대보다 고정지출과 비상금 구조를 정리해 다음 기회를 받을 그릇을 만들어.",
      caution: "큰 투자·대여·충동 결제는 미루고 현금 방어를 우선해.",
    },
    career: {
      strong: "지원·제출·협상처럼 밖에서 평가받는 행동을 실제 일정으로 잡아.",
      mixed: "여러 선택지를 벌리기보다 가장 조건이 명확한 한 자리·한 결과물에 집중해.",
      mild: "이력서·포트폴리오·실력 데이터를 쌓아서 다음 움직임의 근거를 만들어.",
      caution: "홧김 퇴사나 준비 없는 이동은 피하고 현재 자리에서 협상 재료부터 모아.",
    },
    love: {
      strong: "호감이 있으면 표현하고 관계 기준이나 약속을 직접 확인해.",
      mixed: "여러 사람의 반응을 재기보다 신뢰가 확인되는 한 관계에만 에너지를 써.",
      mild: "관계를 억지로 진전시키기보다 말과 행동이 일치하는지 천천히 봐.",
      caution: "연락 텀이나 한 번의 다툼만으로 결론 내리지 말고 감정이 가라앉은 뒤 확인해.",
    },
    path: {
      strong: "이미 시험해본 방향이 있다면 결과물 규모를 한 단계 키워.",
      mixed: "선택지를 한꺼번에 바꾸지 말고 가장 가능성 높은 하나만 실험해.",
      mild: "작은 프로젝트·수업·경험으로 내 데이터를 계속 쌓아.",
      caution: "큰 방향 전환은 보류하고 비용 적은 실험으로만 검증해.",
    },
    people: {
      strong: "도움이 오가는 관계는 먼저 연결하고 함께할 일을 구체화해.",
      mixed: "사람 수보다 약속을 지키는 사람 한두 명에 집중해.",
      mild: "새 인맥을 무리하게 늘리기보다 기존 관계의 경계와 역할을 정리해.",
      caution: "돈·감정·책임을 대신 떠안는 관계는 확장하지 말고 선부터 세워.",
    },
    mental: {
      strong: "컨디션이 올라오면 중요한 루틴 하나를 늘리되 회복 시간도 같이 고정해.",
      mixed: "해야 할 일 하나와 회복 시간 하나만 남겨 과부하를 막아.",
      mild: "수면·식사·알림 차단처럼 기본 리듬을 흔들리지 않게 유지해.",
      caution: "성과를 더 내려고 밀어붙이기보다 일정과 자극을 줄여 회복부터 확보해.",
    },
  };

  const key = concernKey in actions ? concernKey : "money";
  const actionFor = (momentum) => actions[key][momentum] || actions[key].mild;
  const card = (year, period, reason, detail, verdict, momentum) => `
    <div class="rounded-xl ${verdict === "unfavorable" ? "bg-rose-50 border-rose-200" : verdict === "favorable" ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"} border px-3 py-2.5">
      <div class="flex items-center justify-between gap-2">
        <b class="text-slate-900">${year} · ${safe(period)}</b>
        <span class="text-[9.5px] font-bold text-slate-500">${safe(verdictLabel[verdict] || verdictLabel.neutral)} · ${safe(momentumLabel[momentum] || momentumLabel.mild)}</span>
      </div>
      <div class="mt-1.5 text-slate-700"><b>${safe(reason)}</b>. ${safe(actionFor(momentum))}</div>
      <div class="mt-1.5 text-[10px] leading-relaxed text-slate-500">계산 근거: ${safe(detail)}</div>
    </div>`;

  const intro = isT
    ? "시기가 좋다고 자동으로 일이 풀리는 건 아니야. 계산상 힘이 붙는 구간에는 실행을 몰고, 불리한 구간에는 손실을 줄이는 식으로 써야 해."
    : "좋은 흐름은 마음을 놓으라는 뜻이 아니라 조금 덜 힘들게 움직일 수 있는 창구에 가까워. 조심스러운 흐름도 미리 알면 충분히 편하게 지나갈 수 있어.";

  return {
    badge: `2026-2027 ${concernLabel} 타임라인`,
    title: (titles[concernKey] || titles.money)[isT ? "T" : "F"],
    desc: `
      <div class="mb-3 text-slate-700">${safe(intro)}</div>
      <div class="space-y-2">
        ${card("2026", timing.r1, timing.reason, timing.detail, timing.verdict1, timing.momentum1)}
        ${card("2027", timing.r2, timing.reasonR2, timing.detailR2, timing.verdict2, timing.momentum2)}
      </div>
      <div class="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] leading-relaxed text-slate-500">
        <b class="text-slate-700">타이밍 읽는 법</b><br>
        연도 판정은 세운의 십신을 격국의 도움축·걸림축과 대조하고, 월 구간은 네 고민과 연결되는 십신과 격국 도움축을 함께 비교해 고른 값이야. 월 표시는 절기 구간 기준이라 특정 사건이 반드시 생기는 날짜를 뜻하진 않아.
      </div>
    `,
    checklist: `${timing.r1}과 ${timing.r2}에 할 행동을 캘린더에 한 줄씩 미리 적어두기`,
  };
}

'''
s = replace_once(s, marker, builders + marker, 'insert NOTE5/6 builders')

old_vars = '''const noteFour = buildNoteFourPrescription(
  data,
  concernKey,
  concernLabel,
  isT,
);

return ['''
new_vars = '''const noteFour = buildNoteFourPrescription(
  data,
  concernKey,
  concernLabel,
  isT,
);

const noteFive = buildNoteFiveEnvironmentFilter(
  data,
  concernKey,
  concernLabel,
  isT,
);

const noteSix = buildNoteSixTiming(
  data,
  concernKey,
  concernLabel,
  isT,
);

return ['''
s = replace_once(s, old_vars, new_vars, 'wire NOTE5/6 variables')

old_cards = '''          {
            themeNum: "05",
            badge: badges[4],
            title: titles[4],
            desc: act2.d || "",
            checklist: isT
              ? "나를 소모시키는 관계와 환경에는 분명한 기준 세우기"
              : "나를 편안하게 해주는 사람과 환경을 의식적으로 선택하기",
          },
          {
            themeNum: "06",
            badge: badges[5],
            title: titles[5],
            desc: `<b>${source.r1 || ""}</b><br>${source.r1d || ""}<br><br><b>${source.r2 || ""}</b><br>${source.r2d || ""}`,
            checklist: isT
              ? `${concernLabel} 승부처 전에 준비를 끝내고 기회를 놓치지 않기`
              : `다가올 좋은 흐름을 맞이할 수 있도록 마음과 생활 리듬 정비하기`,
          },'''
new_cards = '''          {
            themeNum: "05",
            badge: noteFive.badge,
            title: noteFive.title,
            desc: noteFive.desc,
            checklist: noteFive.checklist,
          },
          {
            themeNum: "06",
            badge: noteSix.badge,
            title: noteSix.title,
            desc: noteSix.desc,
            checklist: noteSix.checklist,
          },'''
s = replace_once(s, old_cards, new_cards, 'replace NOTE5/6 cards')
p.write_text(s, encoding='utf-8')

# -----------------------------------------------------------------------------
# Browser regression: audit NOTE5 + NOTE6 and production wiring.
# -----------------------------------------------------------------------------
tp = Path('tests/pre_note3_browser_regression_v4.cjs')
t = tp.read_text(encoding='utf-8')

t = replace_once(
    t,
    "    typeof buildNoteFourPrescription === 'function' &&\n    typeof analyzeDayMasterStrengthV2 === 'function',",
    "    typeof buildNoteFourPrescription === 'function' &&\n    typeof buildNoteFiveEnvironmentFilter === 'function' &&\n    typeof buildNoteSixTiming === 'function' &&\n    typeof analyzeDayMasterStrengthV2 === 'function',",
    'wait for NOTE5/6 builders',
)

insert_after = "    console.log('NOTE4_AUDIT_PASS', JSON.stringify(note4Audit.out.map(x => ({key:x.key,mode:x.mode,title:x.title}))));\n"
extra = r'''

    const note56Audit = await page.evaluate(() => {
      const labels = { money:'재물·돈복', career:'학업·커리어', love:'연애·썸', path:'진로·미래', people:'인간관계', mental:'번아웃·멘탈' };
      const base = calculateAccurateManse(1998,2,21,'03:10','male');
      const other = calculateAccurateManse(2001,5,6,'14:30','female');
      const out5 = [];
      const out6 = [];
      for (const key of Object.keys(labels)) {
        for (const mode of ['F','T']) {
          const data = { ...base, concernKey:key, userGender:'male', userBirthStr:'19980221' };
          const wiredData = { ...data, rawSolutionTemplate:{ F:{acts:[]}, T:{acts:[]} } };
          const n5 = buildNoteFiveEnvironmentFilter(data, key, labels[key], mode === 'T');
          const i5 = generateConcernNotes(wiredData, mode)[4];
          out5.push({key,mode,title:n5.title,badge:n5.badge,desc:n5.desc,checklist:n5.checklist, integratedTitle:i5?.title||'', integratedDesc:i5?.desc||''});

          const n6 = buildNoteSixTiming(data, key, labels[key], mode === 'T');
          const i6 = generateConcernNotes(wiredData, mode)[5];
          const timing = getTrueBaziTiming(data.dayOheng || 'to', key, data.userGender, data.userBirthStr, data.gyeokguk, data.gyeokStatus, data.realYeonun);
          out6.push({key,mode,title:n6.title,badge:n6.badge,desc:n6.desc,checklist:n6.checklist, r1:timing.r1,r2:timing.r2, integratedTitle:i6?.title||'', integratedDesc:i6?.desc||''});
        }
      }
      const p5a = buildNoteFiveEnvironmentFilter({ ...base, concernKey:'people' }, 'people', labels.people, true);
      const p5b = buildNoteFiveEnvironmentFilter({ ...other, concernKey:'people' }, 'people', labels.people, true);
      const maleTiming = getTrueBaziTiming(base.dayOheng || 'to','love','male','19980221',base.gyeokguk,base.gyeokStatus,base.realYeonun);
      const femaleTiming = getTrueBaziTiming(base.dayOheng || 'to','love','female','19980221',base.gyeokguk,base.gyeokStatus,base.realYeonun);
      return {out5,out6,p5Personalized:p5a.desc!==p5b.desc,maleTiming,femaleTiming,seoulToday:getSeoulTodayYmd()};
    });
    assert(note56Audit.out5.length === 12, `NOTE5 audit count ${note56Audit.out5.length}`);
    assert(new Set(note56Audit.out5.map(x=>x.title)).size === 12, 'NOTE5 titles are not concern/mode specific');
    for (const n of note56Audit.out5) {
      assert(n.desc.includes('내 편 신호'), `NOTE5 ally signal missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('거리 둘 신호'), `NOTE5 villain signal missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('잘 맞는 환경'), `NOTE5 environment missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('왜 이런 필터가 맞나'), `NOTE5 evidence missing ${n.key}/${n.mode}`);
      assert(!/(undefined|NaN|null)/.test(`${n.title}${n.badge}${n.desc}${n.checklist}`), `NOTE5 bad token ${n.key}/${n.mode}`);
      assert(n.integratedTitle===n.title && n.integratedDesc===n.desc, `NOTE5 integration mismatch ${n.key}/${n.mode}`);
    }
    for (const key of Object.keys(LABELS)) {
      const f=note56Audit.out5.find(x=>x.key===key&&x.mode==='F');
      const tt=note56Audit.out5.find(x=>x.key===key&&x.mode==='T');
      assert(f.desc!==tt.desc, `NOTE5 F/T collapsed ${key}`);
    }
    assert(note56Audit.p5Personalized, 'NOTE5 evidence does not change across charts');
    console.log('NOTE5_AUDIT_PASS', JSON.stringify(note56Audit.out5.map(x=>({key:x.key,mode:x.mode,title:x.title}))));

    assert(note56Audit.out6.length === 12, `NOTE6 audit count ${note56Audit.out6.length}`);
    assert(new Set(note56Audit.out6.map(x=>x.title)).size === 12, 'NOTE6 titles are not concern/mode specific');
    for (const n of note56Audit.out6) {
      assert(n.desc.includes(n.r1), `NOTE6 2026 computed period missing ${n.key}/${n.mode}: ${n.r1}`);
      assert(n.desc.includes(n.r2), `NOTE6 2027 computed period missing ${n.key}/${n.mode}: ${n.r2}`);
      assert(n.desc.includes('계산 근거:'), `NOTE6 calculation basis missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('타이밍 읽는 법'), `NOTE6 limitation guide missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('세운의 십신'), `NOTE6 year-method evidence missing ${n.key}/${n.mode}`);
      assert(!/(undefined|NaN|null)/.test(`${n.title}${n.badge}${n.desc}${n.checklist}`), `NOTE6 bad token ${n.key}/${n.mode}`);
      assert(n.integratedTitle===n.title && n.integratedDesc===n.desc, `NOTE6 integration mismatch ${n.key}/${n.mode}`);
    }
    for (const key of Object.keys(LABELS)) {
      const f=note56Audit.out6.find(x=>x.key===key&&x.mode==='F');
      const tt=note56Audit.out6.find(x=>x.key===key&&x.mode==='T');
      assert(f.desc!==tt.desc, `NOTE6 F/T collapsed ${key}`);
    }
    assert(/^\d{4}-\d{2}-\d{2}$/.test(note56Audit.seoulToday), `Seoul today format invalid ${note56Audit.seoulToday}`);
    assert(note56Audit.maleTiming.r1 && note56Audit.femaleTiming.r1, 'gender-specific love timing missing');
    console.log('NOTE6_AUDIT_PASS', JSON.stringify(note56Audit.out6.map(x=>({key:x.key,mode:x.mode,r1:x.r1,r2:x.r2,title:x.title}))));
'''
t = replace_once(t, insert_after, insert_after + extra, 'insert NOTE5/6 browser audit')
tp.write_text(t, encoding='utf-8')
print('NOTE5_NOTE6_PATCH_READY')
