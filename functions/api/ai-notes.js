const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const NOTE_ROLES = [
  "conclusion",
  "cause",
  "contrast",
  "conditions",
  "timing",
  "decision",
];

const DOMAIN_GUIDES = {
  money: {
    label: "돈·재물",
    vocabulary: ["돈", "수입", "지출", "비용", "저축", "보상", "금액", "고정비", "현금", "재물"],
    questions: [
      "돈을 만들어내는 쪽과 실제로 남기는 쪽 중 어디가 더 핵심인지",
      "수입이 늘 때 같이 커질 수 있는 비용·책임·유지 부담이 있는지",
      "돈이 붙는 조건과 새는 조건이 무엇인지",
      "현재 질문에서 수입·지출·유지 여력 중 무엇을 먼저 봐야 하는지",
      "가까운 시기에 실제로 달라지는 것은 수입 기회인지, 비용 부담인지, 감당 여력인지",
      "사용자가 실제 금액을 비교할 때 무엇을 먼저 확인해야 하는지",
    ],
    diagnosticAxes: [
      "돈을 만들어내는 힘 ↔ 실제로 남기는 힘",
      "기회가 늘어나는 쪽 ↔ 비용·책임·고정 부담이 같이 커지는 쪽",
      "한 번 들어오는 돈 ↔ 반복해서 유지되는 돈",
      "수입의 크기 ↔ 수입 뒤에 실제로 남는 몫",
    ],
    genericAdvice: ["지출을 관리하세요", "예산을 세우세요", "저축하세요", "무리한 투자를 피하세요"],
    guardrails: [
      "재성 하나만으로 부자·가난을 단정하지 않는다.",
      "도움 운이 들어온다고 곧바로 돈이 들어온다고 번역하지 않는다.",
      "실제 금액·투자수익·당첨·사업 성공을 예언하지 않는다.",
    ],
  },
  career: {
    label: "학업·직장",
    vocabulary: ["일", "직장", "시험", "합격", "지원", "면접", "업무", "성과", "평가", "이직", "퇴사", "취업", "공부"],
    questions: [
      "준비·실행·성과·평가·지속 중 어디에서 결과 차이가 커지는지",
      "잘하는 것과 실제 평가받는 방식 사이에 어긋남이 있는지",
      "책임·규칙·경쟁이 도움이 되는 조건과 소모시키는 조건",
      "현재 세부질문에서 실제로 먼저 확인해야 할 일/시험 변수",
      "가까운 시기에는 준비, 실행, 평가, 이동 중 어느 축이 변하는지",
      "합격·퇴사·이직을 대신 결정하지 않고 어떤 기준을 비교해야 하는지",
    ],
    diagnosticAxes: [
      "준비하는 힘 ↔ 실제로 제출·실행하는 힘",
      "실력을 쌓는 힘 ↔ 평가받는 자리에서 드러나는 힘",
      "책임을 맡는 힘 ↔ 책임을 오래 감당하는 여력",
      "성과를 내는 방식 ↔ 그 성과가 보상으로 연결되는 방식",
    ],
    genericAdvice: ["열심히 준비하세요", "성과를 보여주세요", "자신감을 가지세요", "도전해보세요"],
    guardrails: [
      "합격·불합격, 채용·해고, 승진을 단정하지 않는다.",
      "특정 직업명을 근거 없이 만들어내지 않는다.",
    ],
  },
  love: {
    label: "연애·썸",
    vocabulary: ["연애", "관계", "상대", "마음", "표현", "연락", "약속", "만남", "썸", "재회", "인연"],
    questions: [
      "내가 관계를 시작·표현·유지하는 과정에서 어디가 가장 크게 갈리는지",
      "끌림과 실제로 오래 맞는 조건이 같은지 다른지",
      "관계에서 내 쪽의 반복 패턴과 갈등 조건이 무엇인지",
      "표현·경계·약속·거리 중 무엇을 확인해야 하는지",
      "가까운 시기에 내 관계 대응이나 만남 조건이 어떻게 달라지는지",
      "상대의 속마음 대신 내가 확인할 수 있는 행동과 기준이 무엇인지",
    ],
    diagnosticAxes: [
      "마음이 생기는 속도 ↔ 마음이 밖으로 보이는 속도",
      "관계를 진지하게 받아들이는 힘 ↔ 관계를 시작하는 속도",
      "끌림 ↔ 오래 편하게 이어지는 조건",
      "표현 ↔ 약속·책임·거리 조절",
    ],
    genericAdvice: ["상대의 말보다 행동을 보세요", "서두르지 마세요", "솔직하게 표현하세요", "좋은 사람을 기다리세요"],
    guardrails: [
      "상대방의 속마음·바람·재회 의사를 사주만으로 단정하지 않는다.",
      "이별·결혼·재회를 확정적으로 예언하지 않는다.",
    ],
  },
  path: {
    label: "진로·적성",
    vocabulary: ["진로", "적성", "강점", "분야", "방향", "경험", "선택", "전환", "성과", "일"],
    questions: [
      "잘하는 방식과 오래 지속할 수 있는 방식이 같은지",
      "준비·실행·표현·평가·보상 중 강점이 실제 성과로 이어지는 지점",
      "맞는 환경과 소모되는 환경의 차이",
      "현재 방향 유지와 전환을 판단할 때 무엇을 비교해야 하는지",
      "가까운 시기에 탐색·실행·전환 중 어느 축이 살아나는지",
      "특정 직업을 찍기보다 어떤 방식의 일에서 강점이 재현되는지",
    ],
    diagnosticAxes: [
      "잘하는 힘 ↔ 실제 성과로 바꾸는 힘",
      "흥미가 붙는 방식 ↔ 오래 지속할 수 있는 방식",
      "혼자 파고드는 힘 ↔ 밖에서 평가·보상받는 방식",
      "현재 강점을 유지하는 것 ↔ 다른 분야로 옮겨도 재현되는 강점",
    ],
    genericAdvice: ["작게 경험해보세요", "다양하게 도전하세요", "좋아하는 일을 하세요", "천천히 찾아보세요"],
    guardrails: [
      "사주만으로 하나의 직업을 정답처럼 지정하지 않는다.",
      "돈이 된다는 이유만으로 적성을 단정하지 않는다.",
    ],
  },
  people: {
    label: "사람·관계",
    vocabulary: ["관계", "사람", "친구", "지인", "가족", "직장", "경계", "연락", "만남", "갈등", "거리"],
    questions: [
      "관계에서 내 몫·표현·책임·경계 중 어디가 가장 크게 갈리는지",
      "처음에는 괜찮다가 반복될수록 소모되는 조건이 있는지",
      "편한 관계와 오래 두면 힘든 관계의 차이",
      "현재 세부관계에서 내가 확인할 수 있는 실제 신호",
      "가까운 시기에 관계 대응 방식이 달라지는 구간이 있는지",
      "끊기/유지를 대신 결정하지 않고 거리 조절 기준을 무엇으로 잡아야 하는지",
    ],
    diagnosticAxes: [
      "내 몫을 지키는 힘 ↔ 상대에게 맞추는 힘",
      "불편함을 알아차리는 것 ↔ 밖으로 말하는 것",
      "책임을 맡는 것 ↔ 관계의 책임을 나누는 것",
      "관계를 유지하는 힘 ↔ 거리를 조절하는 힘",
    ],
    genericAdvice: ["경계를 세우세요", "거리 두세요", "솔직하게 말하세요", "좋은 사람만 만나세요"],
    guardrails: [
      "상대의 성격·의도·악의를 근거 없이 단정하지 않는다.",
      "가족·친구·직장 사람과의 단절을 지시하지 않는다.",
    ],
  },
  mental: {
    label: "마음·스트레스",
    vocabulary: ["컨디션", "회복", "피로", "부담", "생각", "휴식", "생활", "리듬", "스트레스", "번아웃", "무기력"],
    questions: [
      "부담이 쌓이는 방식과 회복이 붙는 방식의 차이",
      "버티는 힘이 있어도 특정 조건에서 소모가 빨라지는지",
      "생각·표현·책임·생활자원 중 어디가 회복에 가장 큰 영향을 주는지",
      "회복되는 환경과 더 지치게 하는 환경의 차이",
      "가까운 시기에 부담/회복 조건이 실제로 달라지는 구간이 있는지",
      "의학적 판단 대신 생활에서 비교할 수 있는 부담·회복 기준이 무엇인지",
    ],
    diagnosticAxes: [
      "버티는 힘 ↔ 회복하는 힘",
      "부담을 안으로 들이는 방식 ↔ 밖으로 빼내는 방식",
      "생각을 쌓는 힘 ↔ 생각을 정리하고 멈추는 힘",
      "책임을 감당하는 힘 ↔ 생활 리듬을 지키는 여력",
    ],
    genericAdvice: ["쉬세요", "무리하지 마세요", "마음을 편하게 가지세요", "생활 습관을 관리하세요"],
    guardrails: [
      "우울증·불안장애·번아웃 등 의학적 진단을 하지 않는다.",
      "치료나 약물 조언을 사주 근거로 하지 않는다.",
    ],
  },
};

const SITUATION_FOCUS = {
  money: {
    saving: "돈이 왜 잘 남지 않는지와 저축·지출을 가르는 조건에 집중한다.",
    income: "수입을 늘릴 때 무엇이 실제 보상으로 연결되고 어떤 부담이 따라붙는지에 집중한다.",
    side: "새 수입원을 만들 때 시작·회수·유지 가능성을 가르는 조건에 집중한다.",
    flow: "앞으로 돈에서 수입 기회·지출/비용·남기는 여력 중 무엇이 먼저 달라지는지와 실제 시기에 집중한다.",
  },
  career: {
    exam: "시험에서 준비·실전·평가·지속력 중 어디가 결과 차이를 만드는지에 집중한다.",
    jobsearch: "취업에서 준비한 것을 지원·면접·평가로 연결하는 과정과 맞는 조직 조건에 집중한다.",
    move: "이직·퇴사에서 현재 자리의 소모 요인과 옮겼을 때 확인해야 할 조건을 비교한다.",
    current: "현재 자리에서 성과·평가·역할·보상이 어떻게 연결될 때 잘 풀리는지에 집중한다.",
  },
  love: {
    crush: "썸·짝사랑에서 내 쪽의 표현·확인·거리 조절을 보되 상대 속마음은 단정하지 않는다.",
    relationship: "현재 연애에서 반복되는 내 반응과 약속·표현·경계가 맞는 조건을 본다.",
    breakup: "헤어진 관계에서 재회 예언이 아니라 내 반복 원인과 다시 볼 때 필요한 변화 조건을 본다.",
    new: "새 인연에서 만남·표현·관계 지속에 유리한 내 조건과 시기를 본다.",
  },
  path: {
    lost: "무엇부터 시험해봐야 방향이 좁혀지는지와 강점이 실제로 드러나는 조건을 본다.",
    current: "지금 길을 이어갈 때 강점이 살아나는 부분과 소모되는 부분을 비교한다.",
    switch: "분야 전환에서 기존 강점이 옮겨갈 수 있는 부분과 새로 감당해야 할 부담을 본다.",
    strength: "반복해서 성과가 나는 방식과 맞는 환경을 중심으로 적성·강점을 설명한다.",
  },
  people: {
    friend: "친구·지인 관계에서 반복 갈등과 경계가 필요한 조건을 본다.",
    work: "직장 관계에서 역할·업무·책임·표현이 어디서 충돌하는지 본다.",
    family: "가족 관계에서 반복해서 부딪히는 내 쪽 조건과 지켜야 할 경계를 본다.",
    distance: "관계를 유지/단절로 단정하지 않고 거리를 조절할 때 확인할 신호를 본다.",
  },
  mental: {
    burnout: "과부하가 쌓이는 조건과 회복 여력이 다시 생기는 조건을 구분한다.",
    overthink: "생각이 많아지는 조건과 생각이 실제 판단·행동으로 정리되는 조건을 본다.",
    low: "무기력을 진단하지 않고 생활 부담과 회복 가능 조건을 본다.",
    recover: "컨디션을 회복할 때 무엇을 줄이고 무엇을 유지해야 하는지 비교 기준을 본다.",
  },
};

const SYSTEM_PROMPT = `
너는 '어떤언니'의 최종 사주 해석기다. 목표는 좋은 조언을 하는 것이 아니라,
"이 사람 사주에서 실제로 무엇이 강하고, 무엇이 약하거나 엇갈리며, 그래서 지금 고민에서 어떻게 드러나는지"
를 일반인이 바로 이해하게 증명하는 것이다.

[절대 역할 분리]
- 생년월일시 계산과 고전 명리 판단은 이미 어떤언니 엔진에서 끝났다.
- 너는 사주를 새로 계산하거나 새로운 명리 사실을 만들지 않는다.
- evidencePacket의 검증된 사실·규칙 결과·교차검증·시기 근거만 사용한다.
- 고민/세부상황은 현실 번역의 범위만 정한다. "연애니까 표현", "취업이니까 준비"처럼 고민에서 명리 결론을 역으로 만들지 않는다.

[가장 중요한 출력 원칙]
- 모든 NOTE는 반드시 "사주 진단 → 왜 그런지 → 현재 고민에서의 의미" 순서로 간다.
- 먼저 이 사주의 비대칭을 잡는다. 예: 강한 것 ↔ 약한 것, 시작 ↔ 유지, 안쪽 판단 ↔ 바깥 표현, 기회 ↔ 감당, 버팀 ↔ 회복.
- 비대칭이 실제 근거에서 잡히지 않으면 억지로 만들지 않는다. 그때는 가장 설명력이 큰 한 방향과 조건 차이를 쓴다.
- 사용자에게는 내부 명리 용어 대신 쉬운 한국어로 그 비대칭을 보여준다.
- "좋은 조언"만 남으면 실패다. 사주 근거를 지워도 성립하는 문장은 핵심 결론으로 쓰지 않는다.
- 각 NOTE의 basis는 반드시 "네 사주에서는..." 또는 "이 사주에서는..."처럼 시작해, 실제 사주에서 잡힌 차이를 1~2문장으로 먼저 밝힌다.
- basis와 title에 명령형 조언을 쓰지 않는다. "하세요/마세요/보세요/두세요/지키세요/기다리세요" 식 제목은 금지한다.

[정확도 규칙]
- 한 가지 십신/규칙을 곧바로 현실 행동 하나로 치환하지 않는다.
- 서로 독립된 근거 2개 이상이 같은 결론을 지지할 때 그 결론을 우선한다.
- 근거가 충돌하면 한쪽을 지우지 말고 "왜 같은 사람에게 두 모습이 함께 가능한지"를 설명한다.
- 근거가 약하면 확정 표현을 낮춘다.
- 사용자가 실제로 하지 않았을 소비습관, 연락습관, 지원행동, 가족행동, 감정상태를 지어내지 않는다.
- 상대방의 속마음, 합격·불합격, 결혼·이별, 특정 수입액, 투자 성과, 의학적 진단을 사주만으로 확정하지 않는다.
- specialStructureGuarded가 true면 일반 규칙만으로 강하게 단정하지 않는다.

[시기 해석]
- timingEvidence가 보여주는 "나를 받쳐주는 시기"와 "고민 결과가 직접 발생하는 시기"를 구분한다.
- 도움 신호가 있다고 돈이 들어온다/합격한다/연애가 생긴다고 번역하지 않는다.
- timing NOTE는 "평소 사주에서 A가 핵심인데 → 이 시기에 B가 보태지거나 흔들려 → 그래서 현재 고민에서 무엇이 상대적으로 쉬워지거나 어려워지는지"까지 연결한다.
- 실제 날짜 근거가 없으면 날짜를 만들지 않는다.

[사용자 언어]
- 신강·신약·격국·용신·상신·기신·통관·월령·지장간·세력 등 전문용어를 최종 문장에 쓰지 않는다.
- "받쳐주는 힘", "보완 요소", "작동 방식", "실제 세력", "운에서 같은 방향" 같은 내부 표현도 그대로 쓰지 않는다.
- "압박/흐름/힘/구조"만 반복하지 말고 돈·평가·표현·약속·경계·회복처럼 현재 고민의 실제 변수로 풀어 쓴다.
- 한자 표기는 쓰지 않는다.
- 단, 쉬운 말로 바꾼다고 사주 근거 자체를 숨기면 안 된다.

[6개 NOTE의 서로 다른 역할]
1) conclusion — 세부질문에 대한 사주상 핵심 답. "이 사람은 무엇이 강하고 무엇이 상대적으로 약하거나 늦게 붙는가"를 먼저 보여준다.
2) cause — 1번 결론이 생기는 원인 사슬. 서로 다른 근거 A+B가 어떻게 C를 만드는지 설명한다.
3) contrast — 이 사람에게 동시에 존재하는 두 면이나, 조건에 따라 반대로 보이는 지점을 설명한다. 실제 근거가 있어야 한다.
4) conditions — 앞에서 나온 사주 특징이 살아나는 조건과 소모되는 조건을 같은 기준으로 정면 비교한다.
5) timing — 평소 사주와 가까운 시기의 차이를 연결한다. 사건 예언이 아니라 무엇이 상대적으로 달라지는지 설명한다.
6) decision — 1~5에서 확인된 사주 진단을 바탕으로 현재 고민에서 실제로 비교할 기준 2~3개를 준다. 여기서 처음으로 조언 비중이 높아져도 된다.

[중복 방지]
- 여섯 NOTE는 같은 결론을 표현만 바꿔 반복하지 않는다.
- conclusion/cause/contrast/conditions는 최소 2개의 비시기 근거를 사용한다.
- timing은 시기 근거와 평소 사주 근거를 함께 사용한다.
- decision도 최소 2개의 사주 근거를 사용해 앞 진단에서 파생된 기준임을 보여준다.
- 작성 후 여섯 title과 focus를 비교해 사실상 같은 주장 둘이 있으면 다시 분리한다.

[문체]
- 제목은 진단형으로 쓴다. 조언형 제목 금지.
- 제목은 12~36자 정도의 자연스러운 문장.
- basis는 1~2문장. 사주에서 잡힌 강약/엇갈림/조건 차이가 분명해야 한다.
- body는 2~4개의 짧은 문단. basis의 이유와 현재 고민에서의 의미를 설명한다.
- F는 부드럽고 함께 풀어주는 말투, T는 짧고 명확한 정리형 말투. 사실은 동일하다.
- "누구에게나 맞는 말"보다 이 사주에만 설명력이 있는 차이를 우선한다.

[evidenceIds]
- allowedEvidenceIds에 실제 존재하는 ID만 사용한다.
- 각 NOTE의 basis/body를 직접 뒷받침하는 ID만 넣는다.
- timing은 timingEvidenceIds가 있으면 그중 최소 1개를 포함한다.

출력은 지정된 JSON 스키마만 따른다.
`.trim();

function reply(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function noteSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      focus: { type: "string" },
      basis: { type: "string" },
      body: { type: "string" },
      evidenceIds: {
        type: "array",
        items: { type: "string" },
      },
      certainty: {
        type: "string",
        enum: ["supported", "guarded"],
      },
    },
    required: ["title", "focus", "basis", "body", "evidenceIds", "certainty"],
  };
}

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(
    NOTE_ROLES.map((role) => [role, noteSchema()]),
  ),
  required: NOTE_ROLES,
};

function extractOutputText(payload) {
  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (const item of output) {
    if (item?.type !== "message") continue;
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        return part.text;
      }
    }
  }
  return "";
}

function uniqueStrings(values) {
  return [...new Set((values || []).filter((v) => typeof v === "string" && v))];
}

function domainGuide(packet) {
  return DOMAIN_GUIDES[packet?.question?.concern] || DOMAIN_GUIDES.money;
}

function situationFocus(packet) {
  const concern = packet?.question?.concern;
  const key = packet?.question?.situationKey;
  return (
    SITUATION_FOCUS?.[concern]?.[key] ||
    "사용자가 고른 세부질문에만 집중하고, 다른 고민 영역으로 새지 않는다."
  );
}

function containsDomainLanguage(text, guide) {
  return (guide?.vocabulary || []).some((word) => String(text || "").includes(word));
}

function hasInternalJargon(text) {
  return /신강|신약|격국|용신|상신|기신|통관|월령|지장간|실제 세력|받쳐주는 힘|보완 요소|작동 방식/.test(
    String(text || ""),
  );
}

function normalizeClaim(text) {
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/[.,!?'"”“‘’·/()\[\]-]/g, "")
    .slice(0, 90);
}

function isImperativeAdvice(text) {
  return /(하세요|마세요|보세요|두세요|지키세요|기다리세요|해보세요|하세요$|마세요$)/.test(
    String(text || ""),
  );
}

function hasSajuAnchor(text) {
  return /(네 사주에서는|이 사주에서는|사주에서 보면|사주를 보면)/.test(
    String(text || ""),
  );
}

function genericAdviceOnly(text, guide) {
  const normalized = String(text || "").replace(/\s+/g, "");
  return (guide?.genericAdvice || []).some((line) =>
    normalized.includes(String(line).replace(/\s+/g, "")),
  );
}

function validateGeneratedNotes(parsed, packet) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("INVALID_STRUCTURED_OUTPUT");
  }

  const allowedIds = uniqueStrings(packet.allowedEvidenceIds);
  const allowed = new Set(allowedIds);
  const timingAllowed = new Set(uniqueStrings(packet.timingEvidenceIds));
  const structuralAllowed = new Set(
    allowedIds.filter((id) => !timingAllowed.has(id)),
  );
  const guide = domainGuide(packet);
  const notes = [];
  const usedFocus = new Set();
  const usedClaims = new Set();
  const evidenceSignatures = new Set();

  for (const role of NOTE_ROLES) {
    const item = parsed[role];
    if (!item || typeof item !== "object") {
      throw new Error("MISSING_NOTE_ROLE");
    }

    const title = String(item.title || "").trim();
    const focus = String(item.focus || "").trim();
    const basis = String(item.basis || "").trim();
    const body = String(item.body || "").trim();
    const evidenceIds = uniqueStrings(item.evidenceIds).filter((id) => allowed.has(id));
    const certainty = item.certainty === "guarded" ? "guarded" : "supported";
    const structuralIds = evidenceIds.filter((id) => structuralAllowed.has(id));
    const timingIds = evidenceIds.filter((id) => timingAllowed.has(id));

    if (
      title.length < 6 ||
      basis.length < 30 ||
      body.length < 70 ||
      focus.length < 3 ||
      evidenceIds.length === 0
    ) {
      throw new Error("WEAK_NOTE_OUTPUT");
    }

    if (!hasSajuAnchor(basis)) {
      throw new Error("SAJU_BASIS_MISSING");
    }
    if (isImperativeAdvice(title) || isImperativeAdvice(basis)) {
      throw new Error("ADVICE_REPLACED_DIAGNOSIS");
    }
    if (genericAdviceOnly(title, guide)) {
      throw new Error("GENERIC_ADVICE_TITLE");
    }
    if (hasInternalJargon(title + " " + basis + " " + body)) {
      throw new Error("INTERNAL_JARGON_LEAK");
    }
    if (!containsDomainLanguage(title + " " + basis + " " + body, guide)) {
      throw new Error("CONCERN_FOCUS_LOST");
    }

    const requiredStructural = Math.min(2, structuralAllowed.size);
    if (role === "timing") {
      if (timingAllowed.size > 0 && timingIds.length < 1) {
        throw new Error("TIMING_EVIDENCE_MISMATCH");
      }
      if (requiredStructural > 0 && structuralIds.length < 1) {
        throw new Error("TIMING_NATAL_LINK_MISSING");
      }
    } else if (requiredStructural > 0 && structuralIds.length < requiredStructural) {
      throw new Error("INSUFFICIENT_STRUCTURAL_EVIDENCE");
    }

    const focusKey = normalizeClaim(focus);
    if (usedFocus.has(focusKey)) {
      throw new Error("DUPLICATE_NOTE_FOCUS");
    }
    usedFocus.add(focusKey);

    const claimKey = normalizeClaim(title);
    if (usedClaims.has(claimKey)) {
      throw new Error("DUPLICATE_NOTE_CLAIM");
    }
    usedClaims.add(claimKey);

    if (role !== "decision") {
      const signature = [...evidenceIds].sort().join("|");
      if (signature && evidenceSignatures.has(signature)) {
        throw new Error("DUPLICATE_EVIDENCE_SET");
      }
      if (signature) evidenceSignatures.add(signature);
    }

    notes.push({
      role,
      title,
      focus,
      basis,
      body,
      evidenceIds,
      certainty,
    });
  }

  return notes;
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  const requestUrl = new URL(request.url);
  return origin === requestUrl.origin;
}

function pricingFor(model) {
  if (model === "gpt-6-sol") {
    return { input: 2, cachedInput: 0.2, output: 10 };
  }
  if (model === "gpt-6-luna") {
    return { input: 0.1, cachedInput: 0.01, output: 0.5 };
  }
  return null;
}

function usageBreakdown(usage, model, env) {
  if (!usage || typeof usage !== "object") return null;
  const inputTokens = Number(usage.input_tokens || 0);
  const cachedInputTokens = Number(usage.input_tokens_details?.cached_tokens || 0);
  const outputTokens = Number(usage.output_tokens || 0);
  const reasoningTokens = Number(usage.output_tokens_details?.reasoning_tokens || 0);
  const visibleOutputTokens = Math.max(0, outputTokens - reasoningTokens);
  const totalTokens = Number(usage.total_tokens || inputTokens + outputTokens);
  const pricing = pricingFor(model);
  const usdKrw = Number(env.USD_KRW_RATE || 1400);

  let estimatedUsd = null;
  let estimatedKrw = null;
  if (pricing) {
    const regularInput = Math.max(0, inputTokens - cachedInputTokens);
    estimatedUsd =
      (regularInput * pricing.input +
        cachedInputTokens * pricing.cachedInput +
        outputTokens * pricing.output) /
      1_000_000;
    estimatedKrw = Math.round(estimatedUsd * usdKrw);
  }

  return {
    inputTokens,
    cachedInputTokens,
    outputTokens,
    reasoningTokens,
    visibleOutputTokens,
    totalTokens,
    estimatedUsd:
      estimatedUsd == null ? null : Math.round(estimatedUsd * 1_000_000) / 1_000_000,
    estimatedKrw,
    usdKrwRate: usdKrw,
    pricingPerMillion: pricing,
    estimateNote:
      pricing
        ? "표준 텍스트 토큰 단가와 설정된 환율로 계산한 예상치"
        : "현재 모델의 단가표가 테스트 코드에 없어 금액 계산 생략",
  };
}

function buildTranslationInstruction(packet) {
  const guide = domainGuide(packet);
  const focus = situationFocus(packet);
  return [
    "[현재 고민 영역] " + guide.label,
    "[사용자가 고른 세부질문] " + (packet?.question?.situationLabel || ""),
    "[이번 답변의 정확한 초점] " + focus,
    "",
    "[이 고민에서 사주 근거를 현실로 번역할 때 비교할 축]",
    ...(guide.diagnosticAxes || []).map((q) => "- " + q),
    "",
    "[반드시 확인할 질문 — 답은 evidencePacket에 있을 때만]",
    ...guide.questions.map((q) => "- " + q),
    "",
    "[누구에게나 할 수 있는 말 — 이것만으로 NOTE를 끝내면 실패]",
    ...(guide.genericAdvice || []).map((g) => "- " + g),
    "",
    "[이 영역의 과장 금지]",
    ...guide.guardrails.map((g) => "- " + g),
    "",
    "위 비교축과 질문은 새로운 사실을 만들어내는 템플릿이 아니다.",
    "반드시 evidencePacket에서 먼저 실제 강점·약점·엇갈림을 고른 뒤, 그 근거가 현재 고민에서 무엇을 뜻하는지 설명해.",
    "각 basis는 쉬운 한국어로 '사주에 무엇이 강하고/약하고/엇갈리는지'를 먼저 보여줘.",
  ].join("\n");
}

export async function onRequestGet(context) {
  return reply(200, {
    ok: true,
    service: "unni-ai-notes-test",
    configured: Boolean(context.env.OPENAI_API_KEY),
    model: context.env.OPENAI_MODEL || "gpt-6-sol",
  });
}

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) {
    return reply(403, {
      ok: false,
      code: "SAME_ORIGIN_REQUIRED",
      message: "같은 사이트에서 시작한 테스트 요청만 허용됩니다.",
    });
  }

  if (!context.env.OPENAI_API_KEY) {
    return reply(500, {
      ok: false,
      code: "OPENAI_API_KEY_MISSING",
      message: "OpenAI API 키가 서버에 설정되지 않았습니다.",
    });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return reply(400, {
      ok: false,
      code: "INVALID_JSON",
      message: "요청 형식을 읽지 못했습니다.",
    });
  }

  const packet = body?.evidencePacket;
  if (!packet || typeof packet !== "object") {
    return reply(400, {
      ok: false,
      code: "EVIDENCE_PACKET_REQUIRED",
      message: "명리 근거 패킷이 없습니다.",
    });
  }

  const encoded = JSON.stringify(packet);
  if (encoded.length > 120000) {
    return reply(413, {
      ok: false,
      code: "EVIDENCE_PACKET_TOO_LARGE",
      message: "근거 패킷이 테스트 제한을 초과했습니다.",
    });
  }

  const allowedEvidenceIds = uniqueStrings(packet.allowedEvidenceIds);
  if (allowedEvidenceIds.length < 2) {
    return reply(400, {
      ok: false,
      code: "INSUFFICIENT_EVIDENCE",
      message: "AI NOTE를 만들 만큼 검증된 명리 근거가 충분하지 않습니다.",
    });
  }

  const model = String(context.env.OPENAI_MODEL || "gpt-6-sol").trim();
  const translationInstruction = buildTranslationInstruction(packet);
  const requestPayload = {
    model,
    store: false,
    reasoning: { effort: "high" },
    max_output_tokens: 10000,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: SYSTEM_PROMPT }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              translationInstruction +
              "\n\n[검증된 evidencePacket]\n" +
              encoded +
              "\n\n이 근거만 사용해 서로 다른 발견 6개를 작성해. 조언보다 사주 진단이 먼저 보여야 하고, 각 NOTE basis에서 왜 이 사람 사주 이야기인지 증명해.",
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "unni_six_notes_v3",
        strict: true,
        schema: OUTPUT_SCHEMA,
      },
    },
  };

  let openaiResponse;
  try {
    openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + context.env.OPENAI_API_KEY,
      },
      body: JSON.stringify(requestPayload),
    });
  } catch {
    return reply(502, {
      ok: false,
      code: "OPENAI_NETWORK_ERROR",
      message: "OpenAI 연결에 실패했습니다.",
    });
  }

  let payload;
  try {
    payload = await openaiResponse.json();
  } catch {
    payload = null;
  }

  if (!openaiResponse.ok) {
    return reply(502, {
      ok: false,
      code: payload?.error?.code || "OPENAI_API_ERROR",
      message:
        payload?.error?.message ||
        "OpenAI가 테스트 NOTE를 생성하지 못했습니다.",
    });
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    return reply(502, {
      ok: false,
      code: "OPENAI_EMPTY_OUTPUT",
      message: "OpenAI 응답에 NOTE 본문이 없습니다.",
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    return reply(502, {
      ok: false,
      code: "OPENAI_INVALID_JSON",
      message: "OpenAI 응답을 구조화된 NOTE로 읽지 못했습니다.",
    });
  }

  let notes;
  try {
    notes = validateGeneratedNotes(parsed, packet);
  } catch (error) {
    return reply(502, {
      ok: false,
      code: String(error?.message || "AI_NOTE_VALIDATION_FAILED"),
      message: "AI NOTE가 사주 근거·고민 집중도·중복 검증을 통과하지 못했습니다. 한 번 더 생성해줘.",
    });
  }

  return reply(200, {
    ok: true,
    model,
    responseId: payload?.id || "",
    usage: payload?.usage || null,
    usageBreakdown: usageBreakdown(payload?.usage || null, model, context.env),
    notes,
  });
}
