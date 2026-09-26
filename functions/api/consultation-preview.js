const JSON_HEADERS = {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
};

const MODEL_DEFAULT = "gpt-6-sol";

const SYSTEM_PROMPT = [
  "너는 '어떤언니'의 결제 전 1:1 사주상담 첫 판단 담당자다.",
  "사주 계산은 evidencePacket의 결정론적 엔진이 이미 끝냈다. 새로운 명리 사실을 만들거나 생년월일을 다시 계산하지 않는다.",
  "목표는 긴 상담을 미리 생성하는 것이 아니다. 사용자가 '내 질문과 내 사주를 실제로 봤다'고 느낄 만큼만 정확하게 첫 판단을 주고, 깊은 상담이 필요한 지점을 자연스럽게 남긴다.",
  "",
  "[반드시 지킬 것]",
  "- 사용자가 물은 질문에 먼저 직접 답한다. 일반 성격 설명으로 시작하지 않는다.",
  "- directAnswer는 결제하지 않아도 쓸모가 있어야 한다. 핵심 결론을 일부러 숨기거나 겁을 줘서 결제를 유도하지 않는다.",
  "- why와 technicalBasis는 evidencePacket 안의 실제 근거만 사용한다.",
  "- 오행 개수 하나만으로 결론내리지 말고 강약·계절·뿌리·십신·격·합충 등 제공된 근거를 교차해 가장 강한 1~2개만 고른다.",
  "- followUp은 사용자의 현재 상황을 한 번 더 좁혀주는 질문 하나만 만든다.",
  "- followUp options는 서로 실제로 다른 상황 3개다. 각 response는 해당 선택을 했을 때 첫 판단이 어떻게 구체화되는지 1~2문장으로 말한다.",
  "- paidScope는 이미 만든 내용을 감추는 목록이 아니다. 지금부터 추가로 깊게 검토해야 할 서로 다른 3개 영역만 적는다.",
  "- 공포·보장·과장·의학적 진단 금지. 한자 출력 금지.",
  "",
  "[로아 F / 서아 T]",
  "- F: 감정을 짧게 받아주고 → 판단 → 이유 순서. 과한 위로나 애교 금지.",
  "- T: 결론 → 근거 → 판단이 달라지는 조건 순서. 공격적 표현 금지.",
  "- 사실과 근거는 F/T에서 동일해야 한다.",
  "",
  "출력은 지정된 JSON 스키마만 따른다."
].join("\n");

function reply(status, body) {
  return new Response(JSON.stringify(body), {status,headers:JSON_HEADERS});
}
function sameOrigin(request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== "null") return origin === requestUrl.origin;
  const referer = request.headers.get("Referer");
  if (!referer) return false;
  try { return new URL(referer).origin === requestUrl.origin; } catch { return false; }
}
function unique(values) {
  return [...new Set((values || []).filter((v) => typeof v === "string" && v))];
}
function normalizeText(value) {
  return String(value || "").replace(/\s+/g," ").trim();
}
function extractOutputText(payload) {
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    if (item?.type !== "message") continue;
    for (const part of Array.isArray(item?.content) ? item.content : []) {
      if (part?.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }
  return "";
}

const CLAIM_SCHEMA = {
  type:"object",
  additionalProperties:false,
  properties:{
    headline:{type:"string"},
    answer:{type:"string"},
    why:{type:"string"},
    technicalBasis:{type:"string"},
    evidenceIds:{type:"array",items:{type:"string"}},
    counterEvidenceIds:{type:"array",items:{type:"string"}},
    certainty:{type:"string",enum:["supported","guarded"]},
  },
  required:["headline","answer","why","technicalBasis","evidenceIds","counterEvidenceIds","certainty"],
};

const OUTPUT_SCHEMA = {
  type:"object",
  additionalProperties:false,
  properties:{
    directAnswer:CLAIM_SCHEMA,
    followUp:{
      type:"object",
      additionalProperties:false,
      properties:{
        question:{type:"string"},
        options:{
          type:"array",minItems:3,maxItems:3,
          items:{
            type:"object",
            additionalProperties:false,
            properties:{
              label:{type:"string"},
              response:{type:"string"},
              focus:{type:"string"},
            },
            required:["label","response","focus"],
          },
        },
      },
      required:["question","options"],
    },
    paidScope:{
      type:"array",minItems:3,maxItems:3,
      items:{
        type:"object",
        additionalProperties:false,
        properties:{title:{type:"string"}},
        required:["title"],
      },
    },
    handoff:{type:"string"},
  },
  required:["directAnswer","followUp","paidScope","handoff"],
};

const CJK_RE = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
const GUARANTEE_RE = /무조건\s*(성공|합격|재회|결혼|당첨)|반드시\s*(성공|합격|재회|결혼|연락)|100\s*%|확실히\s*(붙|합격|재회|결혼)|당첨될|수익률\s*\d/;
const MEDICAL_RE = /우울증|불안장애|공황장애|ADHD|자폐|조울증|번아웃\s*(이야|이다|진단)|약을\s*(먹|끊)|치료(를)?\s*(해야|받아)/;

function validateClaim(item, allowed) {
  if (!item || typeof item !== "object") throw new Error("DIRECT_MISSING");
  const headline=normalizeText(item.headline);
  const answer=normalizeText(item.answer);
  const why=normalizeText(item.why);
  const basis=normalizeText(item.technicalBasis);
  const all=[headline,answer,why,basis].join(" ");
  if (headline.length < 4 || headline.length > 80) throw new Error("DIRECT_HEADLINE");
  if (answer.length < 20 || answer.length > 520) throw new Error("DIRECT_ANSWER");
  if (why.length < 20 || why.length > 600) throw new Error("DIRECT_WHY");
  if (basis.length < 12 || basis.length > 700) throw new Error("DIRECT_BASIS");
  if (CJK_RE.test(all)) throw new Error("USER_VISIBLE_HANJA");
  if (GUARANTEE_RE.test(all)) throw new Error("UNSUPPORTED_GUARANTEE");
  if (MEDICAL_RE.test(all)) throw new Error("MEDICAL_OVERREACH");
  const evidenceIds=unique(item.evidenceIds);
  const counterEvidenceIds=unique(item.counterEvidenceIds);
  if (!evidenceIds.length) throw new Error("DIRECT_NO_EVIDENCE");
  if ([...evidenceIds,...counterEvidenceIds].some((id)=>!allowed.has(id))) throw new Error("DIRECT_BAD_EVIDENCE_ID");
}

function validateOutput(parsed, packet) {
  if (!parsed || typeof parsed !== "object") throw new Error("INVALID_OUTPUT");
  const allowed=new Set(unique(packet.allowedEvidenceIds));
  if (allowed.size < 4) throw new Error("INSUFFICIENT_EVIDENCE");
  validateClaim(parsed.directAnswer,allowed);
  const question=normalizeText(parsed.followUp?.question);
  const options=Array.isArray(parsed.followUp?.options)?parsed.followUp.options:[];
  if (question.length < 8 || question.length > 160 || options.length !== 3) throw new Error("FOLLOWUP_INVALID");
  const labels=new Set();
  for (const option of options) {
    const label=normalizeText(option?.label);
    const response=normalizeText(option?.response);
    const focus=normalizeText(option?.focus);
    if (label.length < 2 || label.length > 36 || response.length < 12 || response.length > 260 || focus.length < 2 || focus.length > 80) throw new Error("FOLLOWUP_OPTION_INVALID");
    if (labels.has(label)) throw new Error("FOLLOWUP_DUPLICATE");
    labels.add(label);
  }
  const paidScope=Array.isArray(parsed.paidScope)?parsed.paidScope:[];
  if (paidScope.length !== 3 || paidScope.some((x)=>normalizeText(x?.title).length < 4 || normalizeText(x?.title).length > 70)) throw new Error("PAID_SCOPE_INVALID");
  if (normalizeText(parsed.handoff).length < 8 || normalizeText(parsed.handoff).length > 220) throw new Error("HANDOFF_INVALID");
  if (CJK_RE.test(JSON.stringify({followUp:parsed.followUp,paidScope,handOff:parsed.handoff}))) throw new Error("USER_VISIBLE_HANJA");
  return parsed;
}

function pricingFor(model) {
  if (model === "gpt-6-sol") return {input:2,cachedInput:0.2,output:10};
  if (model === "gpt-6-luna") return {input:0.1,cachedInput:0.01,output:0.5};
  if (model === "gpt-5.6" || model === "gpt-5.6-sol") return {input:4,cachedInput:0.4,output:20};
  return null;
}
function usageBreakdown(usage,model,env) {
  if (!usage) return null;
  const inputTokens=Number(usage.input_tokens||0);
  const cachedInputTokens=Number(usage.input_tokens_details?.cached_tokens||0);
  const outputTokens=Number(usage.output_tokens||0);
  const pricing=pricingFor(model);
  const usdKrw=Number(env.USD_KRW_RATE||1400);
  const estimatedUsd=pricing
    ? ((inputTokens-cachedInputTokens)*pricing.input+cachedInputTokens*pricing.cachedInput+outputTokens*pricing.output)/1_000_000
    : null;
  return {
    inputTokens,cachedInputTokens,outputTokens,
    totalTokens:Number(usage.total_tokens||inputTokens+outputTokens),
    estimatedKrw:estimatedUsd==null?null:Math.round(estimatedUsd*usdKrw),
  };
}

export async function onRequestGet(context) {
  return reply(200,{
    ok:true,
    service:"unni-consultation-preview-v1",
    configured:Boolean(context.env.OPENAI_API_KEY),
    enabled:String(context.env.OPENAI_CONSULTATION_ENABLED || "1") !== "0",
    model:String(context.env.OPENAI_PREVIEW_MODEL || context.env.OPENAI_MODEL || MODEL_DEFAULT),
  });
}

export async function onRequestPost(context) {
  try {
    if (!sameOrigin(context.request)) return reply(403,{ok:false,code:"SAME_ORIGIN_REQUIRED",message:"같은 사이트에서 시작한 상담 요청만 허용됩니다."});
    if (String(context.env.OPENAI_CONSULTATION_ENABLED || "1") === "0") return reply(503,{ok:false,code:"CONSULTATION_DISABLED",message:"상담 생성 기능이 잠시 점검 중이야."});
    if (!context.env.OPENAI_API_KEY) return reply(500,{ok:false,code:"OPENAI_API_KEY_MISSING",message:"상담 서버 설정을 확인해야 해."});

    let body;
    try {
      const raw=await context.request.text();
      if (raw.length > 150000) return reply(413,{ok:false,code:"PACKET_TOO_LARGE",message:"상담 근거가 허용 범위를 넘었어."});
      body=JSON.parse(raw);
    } catch {
      return reply(400,{ok:false,code:"INVALID_JSON",message:"상담 요청을 읽지 못했어."});
    }

    const packet=body?.evidencePacket;
    const question=normalizeText(packet?.question?.text);
    if (!packet || typeof packet !== "object" || question.length < 4 || question.length > 500) {
      return reply(400,{ok:false,code:"QUESTION_REQUIRED",message:"언니한테 궁금한 걸 조금만 더 구체적으로 적어줘."});
    }
    if (unique(packet.allowedEvidenceIds).length < 4) {
      return reply(400,{ok:false,code:"INSUFFICIENT_EVIDENCE",message:"사주 근거가 충분히 준비되지 않았어. 다시 계산해줘."});
    }

    const model=String(context.env.OPENAI_PREVIEW_MODEL || context.env.OPENAI_MODEL || MODEL_DEFAULT).trim();
    const effort=["low","medium","high"].includes(String(context.env.OPENAI_PREVIEW_REASONING_EFFORT || "").trim())
      ? String(context.env.OPENAI_PREVIEW_REASONING_EFFORT).trim()
      : "medium";
    const encoded=JSON.stringify(packet);
    const payload={
      model,
      store:false,
      reasoning:{effort},
      max_output_tokens:2200,
      input:[
        {role:"system",content:[{type:"input_text",text:SYSTEM_PROMPT}]},
        {role:"user",content:[{type:"input_text",text:
          "[사용자 질문]\n"+question+
          "\n\n[검증된 어떤언니 명리 엔진 근거]\n"+encoded+
          "\n\n긴 심층상담은 만들지 마. 결제 전 첫 판단 하나와 되묻기 1개만 완성해. directAnswer는 질문에 실제로 답하고, followUp 세 선택지는 사용자의 상황을 서로 다르게 좁혀야 해. paidScope는 아직 추가 검토해야 할 범위만 적어."
        }]}
      ],
      text:{format:{type:"json_schema",name:"unni_consultation_preview_v1",strict:true,schema:OUTPUT_SCHEMA}},
    };

    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),45000);
    let response;
    try {
      response=await fetch("https://api.openai.com/v1/responses",{
        method:"POST",
        headers:{"content-type":"application/json",authorization:"Bearer "+context.env.OPENAI_API_KEY},
        body:JSON.stringify(payload),
        signal:controller.signal,
      });
    } catch(error) {
      return reply(error?.name==="AbortError"?504:502,{
        ok:false,
        code:error?.name==="AbortError"?"OPENAI_TIMEOUT":"OPENAI_NETWORK_ERROR",
        message:error?.name==="AbortError"?"첫 판단을 정리하는 데 너무 오래 걸렸어. 한 번만 다시 눌러줘.":"상담 서버 연결이 잠깐 끊겼어. 다시 한 번 해줘.",
      });
    } finally {
      clearTimeout(timeout);
    }

    let raw;
    try { raw=await response.json(); } catch { raw=null; }
    if (!response.ok) return reply(502,{ok:false,code:raw?.error?.code||"OPENAI_API_ERROR",message:raw?.error?.message||"첫 판단을 만들지 못했어."});
    const text=extractOutputText(raw);
    if (!text) return reply(502,{ok:false,code:"OPENAI_EMPTY_OUTPUT",message:"첫 판단 내용이 비어 있어. 다시 한 번 봐줘."});
    let parsed;
    try { parsed=JSON.parse(text); } catch { return reply(502,{ok:false,code:"OPENAI_INVALID_JSON",message:"첫 판단 형식을 확인하지 못했어. 다시 한 번 봐줘."}); }
    try { parsed=validateOutput(parsed,packet); }
    catch(error) { return reply(502,{ok:false,code:String(error?.message||"PREVIEW_VALIDATION_FAILED"),message:"첫 판단이 명리 근거 검증을 통과하지 못했어. 같은 질문으로 한 번만 다시 봐줘."}); }

    return reply(200,{
      ok:true,
      version:"1.0.0",
      model,
      ...parsed,
      usageBreakdown:usageBreakdown(raw?.usage,model,context.env),
    });
  } catch(error) {
    return reply(500,{ok:false,code:"PREVIEW_INTERNAL_ERROR",message:"첫 판단을 준비하는 중 문제가 생겼어."});
  }
}
