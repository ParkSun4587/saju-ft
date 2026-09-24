const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const NOTE_ROLES = [
  "foundation",
  "mechanism",
  "fit",
  "caution",
  "timing",
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

const SYSTEM_PROMPT = [
  "너는 '어떤언니'의 최종 명리 번역기다.",
  "판단은 evidencePacket 안의 계산 엔진이 이미 끝냈다. 너는 새로운 사주 판단을 만들지 않고, 확정된 사실과 교차검증 결론을 사람이 바로 이해하게 번역한다.",
  "",
  "[절대 원칙]",
  "- 사주를 새로 점치지 않는다. evidencePacket.notePlan과 chartFacts, synthesis, crossValidation, timingEvidence 밖의 사실을 추가하지 않는다.",
  "- 각 NOTE는 반드시 '실제 명리 사실 → 그 사실끼리의 원인·결과 → 현실에서의 의미' 순서로 쓴다.",
  "- 정관·편관·식신·상관·정재·편재·정인·편인·비견·겁재, 신강·신약, 득령·득지·득세, 통근, 격국, 상신·기신, 합·충·형·파·해 같은 용어를 숨기지 않는다.",
  "- 전문용어를 쓴 즉시 쉬운 한국어로 뜻을 붙인다. 예: '편관은 경쟁·압박·큰 책임을 뜻하는 힘이야.'",
  "- '버티는 바탕', '다음 단계로 이어지는 고리', '작동 방식', '도움 힘', '흔드는 힘', '돈을 가리키는 자리'처럼 명리 사실을 지운 인공 번역어를 쓰지 않는다.",
  "- 옥토·거목 숲·무대·파도·불씨·그릇처럼 멋있지만 검증 불가능한 비유로 본문을 채우지 않는다.",
  "- 한 NOTE에서 핵심 근거는 2~4개만 전면에 보여주되, notePlan.requiredEvidenceIds는 evidenceIds에 빠짐없이 포함한다.",
  "- 같은 결론을 표현만 바꿔 여러 NOTE에 반복하지 않는다.",
  "",
  "[정확도]",
  "- 오행 rawCount와 weightedInfluence를 구분한다. 개수와 실제 세력이 다르면 그 차이를 직접 설명한다.",
  "- 오행 하나만으로 성격·돈·연애를 단정하지 않는다. 십신·강약·격국·뿌리·관계 중 독립된 근거를 교차검증한다.",
  "- 재물은 재성의 실제 세력과 일간의 감당력, 구조의 성패를 같이 볼 때만 연결한다.",
  "- 표현·실행은 식신·상관, 책임·평가는 정관·편관, 학습·보호는 정인·편인, 자기 힘·경쟁은 비견·겁재를 실제 배치와 세력으로 확인한다.",
  "- 합·충·형·파·해는 다른 구조 근거 없이 단독 길흉으로 과장하지 않는다.",
  "- 특정 수입액, 합격·불합격, 결혼·이별, 상대 속마음, 의학적 진단을 확정하지 않는다.",
  "- specialStructureGuarded가 true면 특수격을 확정하지 않는다.",
  "",
  "[5개 NOTE 역할]",
  "1) foundation — 이 사람 사주의 원본 판독. 일간, 오행 실제 세력, 강약, 득령·득지·득세, 통근, 핵심 십신·격국 중 가장 중요한 사실을 제시한다.",
  "2) mechanism — 왜 이런 패턴이 생기는지 적천수식 원인→결론을 설명한다. 생극 흐름, 압박, 뿌리, 막힌 연결, 합충을 근거로 한다.",
  "3) fit — 어떤 조건에서 장점이 살아나는지 자평진전의 도움·구응·통관·보완 순서와 현재 고민을 연결한다.",
  "4) caution — 어떤 조건에서 구조가 깨지거나 소모되는지 기신·과부하·충돌 근거와 현재 고민을 연결한다.",
  "5) timing — 원국 결론을 유지한 채 대운·세운·월운이 무엇을 추가·충돌시키는지 실제 timingEvidence만으로 설명한다.",
  "",
  "[문장 형식]",
  "- title: 사용자가 3초 안에 이해할 수 있는 결론 한 줄. 시적인 문구 금지.",
  "- focus: 이 NOTE가 다루는 발견을 8~24자 정도의 짧은 명사형으로 적는다. 다른 NOTE와 겹치지 않게 한다.",
  "- basis: 반드시 '네 사주에서는'으로 시작한다. 실제 명리 사실 2개 이상을 이름 그대로 적고, 수치가 의미 있을 때만 수치를 쓴다.",
  "- body: basis의 사실들이 왜 같은 결론으로 이어지는지 2~4문장으로 설명하고 마지막 1문장에서 현재 고민에 연결한다.",
  "- 한 NOTE 전체를 길게 늘이지 않는다. 반복되는 설명은 삭제한다.",
  "- F는 부드럽고 친절하게, T는 짧고 단정하게 쓰되 사실은 동일하다.",
  "",
  "[근거]",
  "- notePlan의 해당 role에 있는 requiredEvidenceIds를 evidenceIds에 모두 포함한다.",
  "- requiredEvidenceCoverageIds는 5개 NOTE 전체에서 하나도 빠뜨리지 않는다.",
  "- allowedEvidenceIds에 없는 ID를 만들지 않는다.",
  "- timing NOTE는 timingEvidenceIds 중 실제 사용한 근거를 반드시 포함한다.",
  "",
  "출력은 지정된 JSON 스키마만 따른다."
].join("\n");

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
  return /((네|이)\s*사주(에서는|는|에서)|사주(를|에서)\s*보면)/.test(
    String(text || ""),
  );
}

function hasConcreteSajuFact(text) {
  const value = String(text || "");
  const namedTerms =
    /비견|겁재|식신|상관|정재|편재|정관|편관|정인|편인|재성|관성|인성|식상|비겁|신강|신약|중화|월령|득령|득지|득세|통근|지장간|격국|상신|기신|용신|합|충|형|파|해|대운|세운|월운|일간/;
  const elementFact =
    /(목|화|토|금|수)\s*(?:기운|오행|[0-9]+(?:\.[0-9]+)?\s*(?:개|%))/;
  return namedTerms.test(value) || elementFact.test(value);
}

function genericAdviceOnly(text, guide) {
  const normalized = String(text || "").replace(/\s+/g, "");
  return (guide?.genericAdvice || []).some((line) =>
    normalized.includes(String(line).replace(/\s+/g, "")),
  );
}

const FORBIDDEN_ABSTRACT =
  /버티는 바탕|이어지는 고리|다음 단계로 이어지는 고리|작동 방식|도움 힘|흔드는 힘|돈을 가리키는 자리|바탕을 흔드는 자리|결과로 잇는 고리/;
const FORBIDDEN_METAPHOR =
  /옥토|거목|숲에 둘러싸|거대한 무대|판을 뒤집|기름진 논밭|불씨|파도처럼|운명의 파도|재물 그릇/;

function countConcreteSajuFacts(text) {
  const value = String(text || "");
  const terms = value.match(
    /비견|겁재|식신|상관|정재|편재|정관|편관|정인|편인|재성|관성|인성|식상|비겁|신강|신약|중화|월령|득령|득지|득세|통근|지장간|격국|상신|기신|용신|합|충|형|파|해|대운|세운|월운|일간/g,
  ) || [];
  const elementFacts = value.match(
    /(목|화|토|금|수)\s*(?:기운|오행|[0-9]+(?:\.[0-9]+)?\s*(?:개|%))/g,
  ) || [];
  return new Set([...terms, ...elementFacts]).size;
}

function planForRole(packet, role) {
  const plan = packet?.notePlan?.[role];
  return plan && typeof plan === "object" ? plan : {};
}

function hasForbiddenTranslationLanguage(text) {
  const value = String(text || "");
  return FORBIDDEN_ABSTRACT.test(value) || FORBIDDEN_METAPHOR.test(value);
}

function validateGeneratedNotes(parsed, packet) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("INVALID_STRUCTURED_OUTPUT");
  }

  const allowedIds = uniqueStrings(packet.allowedEvidenceIds);
  const allowed = new Set(allowedIds);
  const timingAllowed = new Set(uniqueStrings(packet.timingEvidenceIds));
  const guide = domainGuide(packet);
  const notes = [];
  const usedFocus = new Set();
  const usedClaims = new Set();
  const usedEvidence = new Set();

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
    const plan = planForRole(packet, role);
    const requiredEvidenceIds = uniqueStrings(plan.requiredEvidenceIds).filter((id) =>
      allowed.has(id),
    );

    if (
      title.length < 6 ||
      title.length > 52 ||
      basis.length < 35 ||
      basis.length > 260 ||
      body.length < 55 ||
      body.length > 520 ||
      focus.length < 3 ||
      evidenceIds.length === 0
    ) {
      throw new Error("WEAK_NOTE_OUTPUT");
    }

    if (!hasSajuAnchor(basis)) {
      throw new Error("SAJU_BASIS_MISSING");
    }

    const concreteFactCount = countConcreteSajuFacts(title + " " + basis);
    const minimumFacts = role === "timing" ? 1 : 2;
    if (concreteFactCount < minimumFacts) {
      throw new Error("DIRECT_SAJU_FACT_MISSING");
    }

    if (hasForbiddenTranslationLanguage(title + " " + basis + " " + body)) {
      throw new Error("ABSTRACT_OR_METAPHOR_TRANSLATION");
    }
    if (isImperativeAdvice(title) || isImperativeAdvice(basis)) {
      throw new Error("ADVICE_REPLACED_DIAGNOSIS");
    }
    if (genericAdviceOnly(title, guide)) {
      throw new Error("GENERIC_ADVICE_TITLE");
    }
    if (!containsDomainLanguage(title + " " + basis + " " + body, guide)) {
      throw new Error("CONCERN_FOCUS_LOST");
    }

    for (const id of requiredEvidenceIds) {
      if (!evidenceIds.includes(id)) {
        throw new Error("REQUIRED_EVIDENCE_OMITTED");
      }
    }

    if (role === "timing" && timingAllowed.size > 0) {
      if (!evidenceIds.some((id) => timingAllowed.has(id))) {
        throw new Error("TIMING_EVIDENCE_MISMATCH");
      }
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
    evidenceIds.forEach((id) => usedEvidence.add(id));

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

  const coverageIds = uniqueStrings(packet.requiredEvidenceCoverageIds).filter((id) =>
    allowed.has(id),
  );
  const missingCoverage = coverageIds.filter((id) => !usedEvidence.has(id));
  if (missingCoverage.length) {
    throw new Error("ENGINE_EVIDENCE_COVERAGE_GAP");
  }

  return notes;
}

function sameOrigin(request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");

  // Normal browsers: require an exact same-origin match.
  if (origin && origin !== "null") {
    return origin === requestUrl.origin;
  }

  // Some iOS/Safari/Kakao in-app WebViews can omit Origin (or send "null")
  // for same-site fetches. In that case, fall back to Referer instead of
  // rejecting a legitimate request. We still reject when neither proves
  // that the call started from this exact site.
  const referer = request.headers.get("Referer");
  if (!referer) return false;

  try {
    return new URL(referer).origin === requestUrl.origin;
  } catch {
    return false;
  }
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

function mergeUsage(usages) {
  const rows = (usages || []).filter(Boolean);
  if (!rows.length) return null;
  const total = {
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    input_tokens_details: { cached_tokens: 0 },
    output_tokens_details: { reasoning_tokens: 0 },
  };
  for (const usage of rows) {
    total.input_tokens += Number(usage.input_tokens || 0);
    total.output_tokens += Number(usage.output_tokens || 0);
    total.total_tokens += Number(usage.total_tokens || 0);
    total.input_tokens_details.cached_tokens += Number(
      usage.input_tokens_details?.cached_tokens || 0,
    );
    total.output_tokens_details.reasoning_tokens += Number(
      usage.output_tokens_details?.reasoning_tokens || 0,
    );
  }
  return total;
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
    "반드시 evidencePacket의 chartFacts에서 오행 개수·가중 세력·십신·강약·격국·합충을 먼저 확인한 뒤 현재 고민으로 연결해.",
    "각 basis는 '네 사주에서는'으로 시작하고, 오행 또는 십신 또는 신강약/격국 같은 실제 명리 사실을 이름 그대로 최소 하나 적어.",
    "전문용어는 숨기지 말고 바로 뒤에서 쉬운 말로 뜻을 설명해.",
    "",
    "[엔진이 확정한 NOTE 설계]",
    JSON.stringify(packet?.notePlan || {}),
    "",
    "[5개 NOTE 전체에서 반드시 한 번 이상 사용해야 하는 근거]",
    uniqueStrings(packet?.requiredEvidenceCoverageIds).join(" · "),
  ].join("\n");
}

export async function onRequestGet(context) {
  return reply(200, {
    ok: true,
    service: "unni-ai-notes-v4",
    configured: Boolean(context.env.OPENAI_API_KEY),
    model: context.env.OPENAI_MODEL || "gpt-6-sol",
  });
}

async function handlePost(context) {
  if (!sameOrigin(context.request)) {
    return reply(403, {
      ok: false,
      code: "SAME_ORIGIN_REQUIRED",
      message: "같은 사이트에서 시작한 NOTE 요청만 허용됩니다.",
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
  const baseRequestPayload = {
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
              "\n\nnotePlan에 확정된 5개 NOTE만 작성해. 각 NOTE의 requiredEvidenceIds와 factDigest를 먼저 읽고, 그 사실을 빠뜨리거나 다른 말로 추상화하지 마. 전문용어를 그대로 쓰고 바로 쉬운 뜻을 붙여. 새로운 사주 판단, 시적인 비유, 인공적인 추상어는 만들지 마.",
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "unni_five_notes_v4",
        strict: true,
        schema: OUTPUT_SCHEMA,
      },
    },
  };

  async function callOpenAI(correction = "") {
    const requestPayload = JSON.parse(JSON.stringify(baseRequestPayload));
    if (correction) {
      requestPayload.input[1].content[0].text +=
        "\n\n[직전 출력 검증 실패]\n" +
        correction +
        "\n위 오류만 바로잡아 같은 evidencePacket으로 다시 작성해. 새로운 사실은 추가하지 마.";
    }

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
      return {
        ok: false,
        response: reply(502, {
          ok: false,
          code: "OPENAI_NETWORK_ERROR",
          message: "OpenAI 연결에 실패했습니다.",
        }),
      };
    }

    let payload;
    try {
      payload = await openaiResponse.json();
    } catch {
      payload = null;
    }

    if (!openaiResponse.ok) {
      return {
        ok: false,
        response: reply(502, {
          ok: false,
          code: payload?.error?.code || "OPENAI_API_ERROR",
          message:
            payload?.error?.message ||
            "OpenAI가 테스트 NOTE를 생성하지 못했습니다.",
        }),
      };
    }

    const outputText = extractOutputText(payload);
    if (!outputText) {
      return {
        ok: false,
        response: reply(502, {
          ok: false,
          code: "OPENAI_EMPTY_OUTPUT",
          message: "OpenAI 응답에 NOTE 본문이 없습니다.",
        }),
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return {
        ok: false,
        response: reply(502, {
          ok: false,
          code: "OPENAI_INVALID_JSON",
          message: "OpenAI 응답을 구조화된 NOTE로 읽지 못했습니다.",
        }),
      };
    }

    try {
      return {
        ok: true,
        payload,
        notes: validateGeneratedNotes(parsed, packet),
      };
    } catch (error) {
      return {
        ok: false,
        validationError: String(
          error?.message || "AI_NOTE_VALIDATION_FAILED",
        ),
        payload,
      };
    }
  }

  const usages = [];
  let attempts = 1;
  let generated = await callOpenAI();
  if (generated.payload?.usage) usages.push(generated.payload.usage);

  if (!generated.ok && !generated.response && generated.validationError) {
    attempts = 2;
    generated = await callOpenAI(generated.validationError);
    if (generated.payload?.usage) usages.push(generated.payload.usage);
  }

  if (!generated.ok) {
    if (generated.response) return generated.response;
    const failedUsage = mergeUsage(usages);
    return reply(502, {
      ok: false,
      code: generated.validationError || "AI_NOTE_VALIDATION_FAILED",
      message:
        "AI NOTE가 두 번의 사주 근거 검증을 모두 통과하지 못했습니다.",
      attempts,
      usage: failedUsage,
      usageBreakdown: usageBreakdown(failedUsage, model, context.env),
    });
  }

  const usage = mergeUsage(usages);
  return reply(200, {
    ok: true,
    model,
    responseId: generated.payload?.id || "",
    attempts,
    usage,
    usageBreakdown: usageBreakdown(usage, model, context.env),
    notes: generated.notes,
  });
}


export async function onRequestPost(context) {
  try {
    return await handlePost(context);
  } catch (error) {
    return reply(500, {
      ok: false,
      code: "SERVER_RUNTIME_ERROR",
      message: "AI NOTE 서버 처리 중 오류가 발생했습니다.",
      detail:
        error && typeof error.message === "string"
          ? error.message.slice(0, 300)
          : String(error || "unknown").slice(0, 300),
    });
  }
}
