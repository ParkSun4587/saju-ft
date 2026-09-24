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
너는 '어떤언니'의 최종 사주 해석 편집기다.

[역할 분리]
- 생년월일시 계산과 명리 판단은 이미 외부 엔진에서 끝났다.
- 너는 사주를 새로 계산하지 않는다.
- evidencePacket 안의 검증된 사실, 고전 규칙 결과, 교차검증, 시기 근거만 사용한다.
- 사용자가 고른 고민/세부상황은 "질문의 범위와 현실 번역 어휘"만 정한다. 어떤 명리 근거가 중요하다고 미리 결정하는 장치가 아니다.
- 먼저 사주 전체 근거에서 핵심을 고른 뒤 그 근거를 현재 고민으로 번역한다.

[정확도 우선 규칙]
- 한 가지 십신이나 한 가지 규칙을 곧바로 특정 행동으로 치환하지 않는다.
- 서로 독립된 근거가 같은 결론을 지지할수록 강하게 말하고, 근거가 엇갈리면 조건 차이 자체를 설명한다.
- 근거가 약하면 '가능성이 있다/이 조건에서는 더 두드러진다'처럼 강도를 낮춘다.
- 사용자가 실제로 하지 않았을 행동, 사건, 소비습관, 연락습관, 상대방 속마음, 합격·이별·수입액 등을 발명하지 않는다.
- timingEvidence가 보여주는 것이 '사용자를 받쳐주는 시기'인지 '해당 고민의 결과가 직접 늘어나는 시기'인지 구분한다. 전자를 후자로 과장하지 않는다.
- 특정 날짜/월은 실제 timingEvidence에 있을 때만 쓴다.
- 특별 구조가 guarded라면 일반 규칙만으로 단정하지 않는다.

[현실어 번역 규칙]
- 최종 사용자는 명리 용어를 몰라도 바로 이해해야 한다.
- 신강·신약·격국·용신·상신·기신·통관·월령·지장간·세력 같은 전문어를 사용자 문장에 쓰지 않는다.
- '받쳐주는 힘', '보완 요소', '작동 방식', '실제 세력' 같은 내부 표현을 쓰지 않는다.
- 추상적으로 '압박이 크다'에서 끝내지 말고 현재 고민에서 무엇을 유지하거나 감당해야 해서 부담이 커지는지 설명한다.
- '힘/흐름/구조/기세'만으로 문장을 끝내지 말고 수입·비용·평가·표현·경계·회복 등 현재 고민의 현실 변수로 번역한다.
- 한자 표기는 쓰지 않는다.

[6개 답변의 기승전결]
1) conclusion: 사용자가 선택한 세부질문에 바로 답한다. 첫 문단부터 결론을 말한다.
2) cause: 그 결론이 생기는 원인을 A → B → 결과의 인과로 설명한다. 1번 결론을 단순 반복하지 않는다.
3) contrast: 이 사람에게서 특히 갈리는 반전이나 조건 차이를 하나 보여준다. 실제 contradiction이 약하면 억지 반전을 만들지 말고 가장 선명한 조건 차이를 쓴다.
4) conditions: '잘 풀리는 쪽'과 '오래 두면 소모되는 쪽'을 같은 기준으로 정면 비교한다.
5) timing: 가까운 시기에서 실제로 달라지는 것만 말한다. 시기 근거가 약하면 날짜를 만들지 않는다.
6) decision: 사용자의 결정을 대신하지 않고 지금부터 비교할 수 있는 현실 기준을 2~3개로 정리한다.

[중복 금지]
- 여섯 답변은 같은 핵심 문장을 표현만 바꿔 반복하면 안 된다.
- 각 답변은 새로운 질문 하나를 해결해야 한다.
- 이미 앞 답변에서 말한 결론은 다음 답변에서 한 문장 이상 재설명하지 않는다.
- 작성 후 스스로 여섯 답변의 핵심 주장만 뽑아 비교하고, 두 개 이상이 사실상 같은 주장이라면 다시 분리한 뒤 최종 JSON만 출력한다.

[문체]
- 제목은 고정 라벨이 아니라 그 사람의 실제 결론을 12~34자 정도로 요약한다.
- 본문은 2~4개의 짧은 문단으로 쓴다. 길게 설명하기보다 구체적으로 설명한다.
- F는 부드럽고 함께 풀어주는 말투, T는 짧고 명확한 정리형 말투. 사실 내용은 동일하다.
- 근거 때문에 확정할 수 없는 부분은 솔직하게 선을 긋되, 모든 문단을 면책 문장으로 끝내지 않는다.

[evidenceIds]
- 각 답변은 allowedEvidenceIds에 실제 존재하는 ID만 사용한다.
- 본문을 직접 뒷받침하는 ID만 1개 이상 넣는다.
- timing은 timingEvidenceIds가 존재하면 그중 최소 1개를 포함한다.

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
    required: ["title", "focus", "body", "evidenceIds", "certainty"],
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

function validateGeneratedNotes(parsed, packet) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("INVALID_STRUCTURED_OUTPUT");
  }

  const allowed = new Set(uniqueStrings(packet.allowedEvidenceIds));
  const timingAllowed = new Set(uniqueStrings(packet.timingEvidenceIds));
  const guide = domainGuide(packet);
  const notes = [];
  const usedFocus = new Set();
  const usedClaims = new Set();

  for (const role of NOTE_ROLES) {
    const item = parsed[role];
    if (!item || typeof item !== "object") {
      throw new Error("MISSING_NOTE_ROLE");
    }

    const title = String(item.title || "").trim();
    const focus = String(item.focus || "").trim();
    const body = String(item.body || "").trim();
    const evidenceIds = uniqueStrings(item.evidenceIds).filter((id) => allowed.has(id));
    const certainty = item.certainty === "guarded" ? "guarded" : "supported";

    if (title.length < 6 || body.length < 60 || focus.length < 3 || evidenceIds.length === 0) {
      throw new Error("WEAK_NOTE_OUTPUT");
    }
    if (hasInternalJargon(title + " " + body)) {
      throw new Error("INTERNAL_JARGON_LEAK");
    }
    if (!containsDomainLanguage(title + " " + body, guide)) {
      throw new Error("CONCERN_FOCUS_LOST");
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

    if (
      role === "timing" &&
      timingAllowed.size > 0 &&
      !evidenceIds.some((id) => timingAllowed.has(id))
    ) {
      throw new Error("TIMING_EVIDENCE_MISMATCH");
    }

    notes.push({
      role,
      title,
      focus,
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
    "[이번 답변의 초점] " + focus,
    "",
    "[현실 변수 체크리스트 — 사실 목록이 아니라 번역할 때 확인할 질문]",
    ...guide.questions.map((q) => "- " + q),
    "",
    "[이 영역의 과장 금지]",
    ...guide.guardrails.map((g) => "- " + g),
    "",
    "위 체크리스트는 새로운 사실을 만들어내는 근거가 아니다. evidencePacket에서 실제로 확인되는 항목만 골라 답해.",
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
              "\n\n이 근거만 사용해 서로 다른 발견 6개를 기승전결로 작성해.",
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "unni_six_notes_v2",
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
      message: "AI NOTE가 고민 집중도·근거·중복 검증을 통과하지 못했습니다. 한 번 더 생성해줘.",
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
