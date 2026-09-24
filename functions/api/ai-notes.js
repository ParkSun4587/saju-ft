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

const SYSTEM_PROMPT = `
너는 '어떤언니'의 최종 사주 해석 편집기다.

중요한 전제:
- 사용자의 생년월일시와 사주 계산은 이미 외부 명리 엔진에서 끝났다.
- 너는 사주를 새로 계산하거나 새로운 명리 사실을 발명하면 안 된다.
- 입력으로 제공된 evidencePacket 안의 사실, 규칙 결과, 교차검증, 시기 근거만 사용한다.
- 사용자가 고른 고민/세부상황은 "질문의 범위"일 뿐, 어떤 명리 근거를 우선해야 하는지 미리 정하는 규칙이 아니다.
- 먼저 사주 전체 근거에서 설명력이 높은 사실과 서로 같은 결론을 지지하는 근거를 찾고, 그다음 현재 고민에 번역한다.
- 근거가 서로 충돌하면 한쪽을 지우지 말고, 왜 조건에 따라 다르게 나타나는지 설명한다.
- 근거가 약하면 약하다고 표현한다. 근거가 없는 사건, 행동 습관, 상대방 속마음, 성공/실패, 합격/이별/돈 액수 등을 지어내지 않는다.
- 특정 날짜/월을 말할 때는 timingEvidence 안에 실제 해당 근거가 있을 때만 말한다.
- 전문 명리 용어를 사용자에게 그대로 던지지 않는다. 신강·신약·격국·용신·상신·기신·통관·월령·지장간 같은 말은 쉬운 한국어로 번역한다.
- 한자 표기는 사용하지 않는다.
- "힘, 흐름, 구조, 기세" 같은 추상어만 반복하지 말고 무엇이 어떻게 달라지는지 원인과 조건을 풀어 쓴다.
- 여섯 답변 모두 사용자가 고른 고민 범위 안에서만 답한다. 돈 고민에서 갑자기 연애/가족/직업 일반론으로 새지 않는다.
- 같은 말을 여섯 번 반복하지 않는다. 여섯 답변은 하나의 상담처럼 앞 답을 이어받아 점점 깊어진다.
- 제목은 고정 라벨이 아니라 그 사람의 실제 결론을 요약한 자연스러운 문장으로 만든다.
- 각 본문은 보통 2~4개의 짧은 문단 분량으로 충분히 설명하되 군더더기는 줄인다.
- F 모드는 부드럽고 함께 풀어주는 말투, T 모드는 짧고 명확한 정리형 말투로 쓴다. 사실 자체는 모드에 따라 바꾸지 않는다.
- 사용자의 결정을 대신하지 않는다. 마지막 답변은 "해라/하지 마라"가 아니라 무엇을 비교하고 확인해야 하는지 기준을 준다.

여섯 답변의 역할:
1) conclusion: 지금 이 고민에 대한 가장 중요한 결론을 먼저 말한다.
2) cause: 왜 이 고민이 반복되거나 막히는지 원인 사슬을 설명한다.
3) contrast: 이 사람에게서 특히 다르게 나타나는 반전/조건 차이를 설명한다.
4) conditions: 같은 고민에서 잘 풀리는 조건과 오래 두면 소모되는 조건을 대비한다.
5) timing: 가까운 시기에서 실제로 차이가 커지는 때를 설명한다. 뚜렷한 시기 근거가 없으면 억지 날짜를 만들지 않는다.
6) decision: 지금부터 이 고민을 판단할 때 가장 먼저 볼 비교 기준을 정리한다.

evidenceIds:
- 각 답변의 evidenceIds에는 반드시 입력의 allowedEvidenceIds에 실제 존재하는 규칙 ID만 넣는다.
- 본문을 직접 뒷받침하는 ID만 고른다.
- 최소 1개 이상 넣는다.
- timing 답변은 timingEvidenceIds가 비어 있지 않다면 그중 최소 1개를 반드시 포함한다.

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
    required: ["title", "body", "evidenceIds", "certainty"],
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

function validateGeneratedNotes(parsed, packet) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("INVALID_STRUCTURED_OUTPUT");
  }

  const allowed = new Set(uniqueStrings(packet.allowedEvidenceIds));
  const timingAllowed = new Set(uniqueStrings(packet.timingEvidenceIds));
  const notes = [];

  for (const role of NOTE_ROLES) {
    const item = parsed[role];
    if (!item || typeof item !== "object") {
      throw new Error("MISSING_NOTE_ROLE");
    }

    const title = String(item.title || "").trim();
    const body = String(item.body || "").trim();
    const evidenceIds = uniqueStrings(item.evidenceIds).filter((id) => allowed.has(id));
    const certainty = item.certainty === "guarded" ? "guarded" : "supported";

    if (title.length < 4 || body.length < 30 || evidenceIds.length === 0) {
      throw new Error("WEAK_NOTE_OUTPUT");
    }

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
  const requestPayload = {
    model,
    store: false,
    reasoning: { effort: "high" },
    max_output_tokens: 12000,
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
              "아래 evidencePacket만 근거로 새 6개 상담 답변을 작성해.\n\n" +
              encoded,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "unni_six_notes",
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
      message: "AI NOTE의 근거 연결 검증을 통과하지 못했습니다.",
    });
  }

  return reply(200, {
    ok: true,
    model,
    responseId: payload?.id || "",
    usage: payload?.usage || null,
    notes,
  });
}
