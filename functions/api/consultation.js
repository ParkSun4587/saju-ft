const JSON_HEADERS = {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
};

const MODEL_DEFAULT = "gpt-5.6";
const MIN_SECTIONS = 2;
const MAX_SECTIONS = 7;

const SYSTEM_PROMPT = [
  "너는 '어떤언니'의 1:1 명리 상담 해석가다.",
  "사주 계산은 evidencePacket의 결정론적 엔진이 이미 끝냈다. 절대로 생년월일을 다시 계산하거나 새로운 명리 사실을 만들어내지 않는다.",
  "네 역할은 사용자의 자유질문을 정확히 이해하고, 사주 전체 근거를 서로 연결해 그 질문에 직접 답하는 것이다.",
  "",
  "[제품 철학]",
  "- 고정된 돈/직장/연애 카테고리나 고정 NOTE 개수에 사용자를 끼워 맞추지 않는다.",
  "- 먼저 사용자가 실제로 무엇을 묻는지 1~5개의 하위질문으로 분해한다.",
  "- 그 다음 사주 전체에서 하나의 CENTRAL THESIS를 잡는다. 이후 답변은 그 중심 인과를 서로 다른 각도에서 확장해야 한다.",
  "- 같은 핵심 구조를 여러 섹션에서 다시 언급할 수 있지만, 같은 문장을 바꾸어 반복하지 않는다. 매번 새로운 의미·근거·결정 기준을 더한다.",
  "- 질문에 대한 결론을 피하지 않는다. 답을 먼저 말하고, 그 다음 왜 그런지와 어디까지 말할 수 있는지를 설명한다.",
  "- 사용자가 묻지 않은 삶의 영역을 분량 채우기용으로 억지로 추가하지 않는다.",
  "",
  "[근거 규칙]",
  "- chartFacts, synthesis, crossValidation, claims, timingEvidence 밖의 사실을 추가하지 않는다.",
  "- 오행 개수만으로 결론내리지 않는다. 실제 세력, 계절, 뿌리, 신강·신약, 십신 위치와 세력, 격의 성패, 도움·방해, 생극제화, 합충형파해를 질문에 필요한 만큼 교차검증한다.",
  "- 같은 재성 비율이어도 감당력·식상 연결·비겁 관계·격에서의 역할·뿌리·합충이 다르면 다른 결론이 나와야 한다.",
  "- 반대 근거가 있으면 counterEvidenceIds에 넣고 표현 강도를 낮춘다.",
  "- supported는 독립적인 근거가 충분히 겹칠 때만 쓴다. 애매하면 guarded로 낮춘다.",
  "- 미래 시기는 원국 결론 위에 대운·세운·월운 근거가 실제로 겹칠 때만 말한다. 십신 하나만으로 '연락이 온다', '합격한다', '사람이 생긴다' 같은 사건을 만들지 않는다.",
  "",
  "[구체성 규칙]",
  "- 구체적으로 말할 수 있는 것은 최대한 구체적으로 말한다. 일반적인 자기계발 조언으로 끝내지 않는다.",
  "- 단, 배우자 직업·외모, 상대 속마음, 특정 사건 발생, 복권/투자 수익, 특정 금액, 합격·채용·재회·결혼 보장, 행운 숫자·색·방향·국가 같은 디테일을 근거 없이 만들지 않는다.",
  "- 의학적 진단이나 치료 판단을 사주로 하지 않는다.",
  "- '가능성은 여러 가지'처럼 답을 회피하지 않는다. 비교 질문이면 어느 쪽 구조가 더 자연스러운지와 조건을 말한다.",
  "- 정확한 결과를 보장한다는 표현은 금지한다.",
  "",
  "[사용자 언어]",
  "- 사용자에게 한자를 출력하지 않는다. 갑·을·병·정·무·기·경·신·임·계, 인·묘·진 같은 이름이 필요하면 한국어 음으로만 쓴다.",
  "- 정관, 상관, 편재, 신약, 월령, 통근, 격국, 상신, 기신 등 실제 명리 용어는 숨기지 않는다. 처음 등장할 때 바로 쉬운 뜻을 붙인다.",
  "- '에너지', '작동 방식', '압력군', '보완 후보', '두 번째 축' 같은 엔진식 추상어로 명리 근거를 가리지 않는다.",
  "- 옥토, 거목 숲, 운명의 파도, 거대한 무대 같은 시적인 비유로 정확한 판단을 대신하지 않는다.",
  "",
  "[로아 F / 서아 T]",
  "- F: 사용자가 왜 이 질문을 하게 됐는지 감정적 맥락을 짧게 받아준 뒤, 이유→사주 구조→선택 순서로 자연스럽게 안내한다. 과한 위로·애교·ㅎㅎ 금지.",
  "- T: 결론→핵심 근거→위험 조건→행동 기준 순서로 짧고 명확하게 간다. 공격적이거나 차갑게 몰아붙이지 않는다.",
  "- 사실·판단·근거는 F/T가 동일해야 하며 표현 순서와 말투만 달라야 한다.",
  "",
  "[출력 설계]",
  "- questionPlan은 사용자의 실제 질문을 구조화한 내부 계획이다. intentTags는 자유롭게 붙이되 기존 6개 고민 체계에 종속시키지 않는다.",
  "- 질문이 너무 모호해서 사주만으로 무엇을 답해야 할지 정할 수 없을 때만 needsClarification=true로 하고 딱 한 질문만 한다. 웬만하면 추가질문 없이 답한다.",
  "- centralThesis는 이 사람 사주 전체에서 이번 질문을 관통하는 하나의 중심 인과다.",
  "- directAnswer는 사용자가 물은 것을 먼저 직접 답한다.",
  "- sections는 질문에 필요한 만큼만 2~7개 만든다. 최종 화면은 directAnswer + centralThesis + sections로 4~9개가 된다.",
  "- 모든 section은 서로 다른 기능을 해야 한다. 예: 선택 비교, 돈이 붙는 방식, 실패 조건, 관계 기준, 시기, 지금 행동 등.",
  "- timing은 질문에 시기 의미가 있거나 실제 timingEvidence가 결정에 도움이 될 때만 section type=timing으로 넣는다.",
  "- technicalBasis는 전문 사용자가 펼쳐볼 수 있는 실제 명리 근거 설명이다.",
  "",
  "출력은 지정된 JSON 스키마만 따른다."
].join("\n");

function reply(status, body) {
  return new Response(JSON.stringify(body), {status,headers:JSON_HEADERS});
}
function unique(values) {
  return [...new Set((values || []).filter((v) => typeof v === "string" && v))];
}
function sameOrigin(request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== "null") return origin === requestUrl.origin;
  const referer = request.headers.get("Referer");
  if (!referer) return false;
  try { return new URL(referer).origin === requestUrl.origin; } catch { return false; }
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
const SECTION_SCHEMA = {
  type:"object",
  additionalProperties:false,
  properties:{
    id:{type:"string"},
    type:{type:"string",enum:["explanation","comparison","pattern","fit","caution","money","career","relationship","timing","action","other"]},
    label:{type:"string"},
    title:{type:"string"},
    answer:{type:"string"},
    why:{type:"string"},
    technicalBasis:{type:"string"},
    nextAction:{type:"string"},
    evidenceIds:{type:"array",items:{type:"string"}},
    counterEvidenceIds:{type:"array",items:{type:"string"}},
    certainty:{type:"string",enum:["supported","guarded"]},
  },
  required:["id","type","label","title","answer","why","technicalBasis","nextAction","evidenceIds","counterEvidenceIds","certainty"],
};
const OUTPUT_SCHEMA = {
  type:"object",
  additionalProperties:false,
  properties:{
    questionPlan:{
      type:"object",
      additionalProperties:false,
      properties:{
        primaryIntent:{type:"string"},
        intentTags:{type:"array",items:{type:"string"}},
        directQuestions:{type:"array",items:{type:"string"}},
        decisionType:{type:"string"},
        timeRange:{type:"string"},
        needsClarification:{type:"boolean"},
        clarifyingQuestion:{type:"string"},
      },
      required:["primaryIntent","intentTags","directQuestions","decisionType","timeRange","needsClarification","clarifyingQuestion"],
    },
    centralThesis:CLAIM_SCHEMA,
    directAnswer:CLAIM_SCHEMA,
    sections:{type:"array",minItems:MIN_SECTIONS,maxItems:MAX_SECTIONS,items:SECTION_SCHEMA},
  },
  required:["questionPlan","centralThesis","directAnswer","sections"],
};

const CJK_RE = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
const METAPHOR_RE = /옥토|거목\s*숲|운명의\s*파도|거대한\s*무대|재물\s*그릇|불씨를\s*살려|판을\s*뒤집을\s*시간/;
const INTERNAL_JARGON_RE = /압력군|보완\s*후보|두\s*번째\s*축|작동\s*방식|지원\s*신호|시기\s*신호|현실의\s*규칙/;
const GUARANTEE_RE = /무조건\s*(성공|합격|재회|결혼|당첨)|반드시\s*(성공|합격|재회|결혼|연락)|100\s*%|확실히\s*(붙|합격|재회|결혼)|상대가\s*(먼저\s*)?연락(해|할)|당첨될|수익률\s*\d|배우자(의)?\s*(직업|외모)/;
const MEDICAL_RE = /우울증|불안장애|공황장애|ADHD|자폐|조울증|번아웃\s*(이야|이다|진단)|약을\s*(먹|끊)|치료(를)?\s*(해야|받아)/;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g," ").trim();
}
function evidenceFamily(id) {
  if (id.startsWith("CHART_")) return id;
  if (/DITIAN|DTS|적천/i.test(id)) return "DITIAN";
  if (/ZIPING|ZP|자평/i.test(id)) return "ZIPING";
  if (/TIMING|DAEUN|SEYUN|WOLUN|MONTH|YEAR/i.test(id)) return "TIMING";
  if (/REL|CLASH|COMBINE|PUNISH|HARM|BREAK/i.test(id)) return "RELATION";
  return "RULE";
}
function strongEnough(item) {
  const ids = unique(item?.evidenceIds);
  if (item?.certainty !== "supported") return true;
  if (ids.length < 3) return false;
  return new Set(ids.map(evidenceFamily)).size >= 2;
}
function validateClaim(item, allowed, label) {
  if (!item || typeof item !== "object") throw new Error(label+"_MISSING");
  const text = [item.headline,item.answer,item.why,item.technicalBasis].map(normalizeText).join(" ");
  if (normalizeText(item.headline).length < 5 || normalizeText(item.headline).length > 80) throw new Error(label+"_HEADLINE");
  if (normalizeText(item.answer).length < 20 || normalizeText(item.answer).length > 900) throw new Error(label+"_ANSWER");
  if (normalizeText(item.why).length < 20 || normalizeText(item.why).length > 1000) throw new Error(label+"_WHY");
  if (normalizeText(item.technicalBasis).length < 15 || normalizeText(item.technicalBasis).length > 1200) throw new Error(label+"_BASIS");
  if (CJK_RE.test(text)) throw new Error("USER_VISIBLE_HANJA");
  if (METAPHOR_RE.test(text)) throw new Error("POETIC_METAPHOR");
  if (INTERNAL_JARGON_RE.test(text)) throw new Error("ENGINE_JARGON");
  if (GUARANTEE_RE.test(text)) throw new Error("UNSUPPORTED_GUARANTEE");
  if (MEDICAL_RE.test(text)) throw new Error("MEDICAL_OVERREACH");
  const evidenceIds = unique(item.evidenceIds);
  const counterEvidenceIds = unique(item.counterEvidenceIds);
  if (!evidenceIds.length) throw new Error(label+"_NO_EVIDENCE");
  if ([...evidenceIds,...counterEvidenceIds].some((id) => !allowed.has(id))) throw new Error(label+"_BAD_EVIDENCE_ID");
  if (!strongEnough(item)) throw new Error(label+"_SUPPORTED_TOO_THIN");
}
function duplicateKey(text) {
  return normalizeText(text).replace(/[.,!?'"“”‘’·:;()\[\]\-]/g,"").slice(0,100);
}
function validateOutput(parsed, packet) {
  if (!parsed || typeof parsed !== "object") throw new Error("INVALID_OUTPUT");
  const allowed = new Set(unique(packet.allowedEvidenceIds));
  if (allowed.size < 4) throw new Error("INSUFFICIENT_EVIDENCE");
  if (!parsed.questionPlan || !Array.isArray(parsed.questionPlan.directQuestions) || !parsed.questionPlan.directQuestions.length) {
    throw new Error("QUESTION_PLAN_MISSING");
  }
  if (CJK_RE.test(JSON.stringify(parsed.questionPlan))) throw new Error("USER_VISIBLE_HANJA");
  validateClaim(parsed.centralThesis,allowed,"THESIS");
  validateClaim(parsed.directAnswer,allowed,"DIRECT");
  const sections = Array.isArray(parsed.sections) ? parsed.sections : [];
  if (sections.length < MIN_SECTIONS || sections.length > MAX_SECTIONS) throw new Error("SECTION_COUNT");
  const titles = new Set();
  let timingCount = 0;
  for (const section of sections) {
    const claimLike = {
      headline:section.title,
      answer:section.answer,
      why:section.why,
      technicalBasis:section.technicalBasis,
      evidenceIds:section.evidenceIds,
      counterEvidenceIds:section.counterEvidenceIds,
      certainty:section.certainty,
    };
    validateClaim(claimLike,allowed,"SECTION");
    const key = duplicateKey(section.title);
    if (titles.has(key)) throw new Error("DUPLICATE_SECTION");
    titles.add(key);
    if (section.type === "timing") {
      timingCount++;
      const timingAllowed = new Set(unique(packet.timingEvidenceIds));
      if (timingAllowed.size && !unique(section.evidenceIds).some((id) => timingAllowed.has(id))) {
        throw new Error("TIMING_EVIDENCE_MISSING");
      }
    }
    const next = normalizeText(section.nextAction);
    if (next.length > 260) throw new Error("NEXT_ACTION_TOO_LONG");
  }
  if (timingCount > 1) throw new Error("DUPLICATE_TIMING_SECTION");
  const allText = JSON.stringify({centralThesis:parsed.centralThesis,directAnswer:parsed.directAnswer,sections});
  if (CJK_RE.test(allText)) throw new Error("USER_VISIBLE_HANJA");
  return parsed;
}

function pricingFor(model) {
  if (model === "gpt-5.6" || model === "gpt-5.6-sol") {
    return {input:4,cachedInput:0.4,output:20};
  }
  return null;
}
function usageBreakdown(usage, model, env) {
  if (!usage) return null;
  const inputTokens = Number(usage.input_tokens || 0);
  const cachedInputTokens = Number(usage.input_tokens_details?.cached_tokens || 0);
  const outputTokens = Number(usage.output_tokens || 0);
  const reasoningTokens = Number(usage.output_tokens_details?.reasoning_tokens || 0);
  const visibleOutputTokens = Math.max(0,outputTokens-reasoningTokens);
  const pricing = pricingFor(model);
  const usdKrw = Number(env.USD_KRW_RATE || 1400);
  let estimatedUsd = null;
  if (pricing) {
    estimatedUsd = ((inputTokens-cachedInputTokens)*pricing.input + cachedInputTokens*pricing.cachedInput + outputTokens*pricing.output)/1_000_000;
  }
  return {
    inputTokens,cachedInputTokens,outputTokens,reasoningTokens,visibleOutputTokens,
    totalTokens:Number(usage.total_tokens || inputTokens+outputTokens),
    estimatedUsd:estimatedUsd == null ? null : Math.round(estimatedUsd*1e6)/1e6,
    estimatedKrw:estimatedUsd == null ? null : Math.round(estimatedUsd*usdKrw),
    usdKrwRate:usdKrw,
  };
}

export async function onRequestGet(context) {
  return reply(200,{
    ok:true,
    service:"unni-consultation-v1",
    configured:Boolean(context.env.OPENAI_API_KEY),
    enabled:String(context.env.OPENAI_CONSULTATION_ENABLED || "1") !== "0",
    model:String(context.env.OPENAI_MODEL || MODEL_DEFAULT),
  });
}

export async function onRequestPost(context) {
  try {
    if (!sameOrigin(context.request)) return reply(403,{ok:false,code:"SAME_ORIGIN_REQUIRED",message:"같은 사이트에서 시작한 상담 요청만 허용됩니다."});
    if (String(context.env.OPENAI_CONSULTATION_ENABLED || "1") === "0") return reply(503,{ok:false,code:"CONSULTATION_DISABLED",message:"상담 생성 기능이 잠시 점검 중이야."});
    if (!context.env.OPENAI_API_KEY) return reply(500,{ok:false,code:"OPENAI_API_KEY_MISSING",message:"상담 서버 설정을 확인해야 해."});
    let body;
    try {
      const raw = await context.request.text();
      if (raw.length > 150000) return reply(413,{ok:false,code:"PACKET_TOO_LARGE",message:"상담 근거가 허용 범위를 넘었어."});
      body = JSON.parse(raw);
    } catch {
      return reply(400,{ok:false,code:"INVALID_JSON",message:"상담 요청을 읽지 못했어."});
    }
    const packet = body?.evidencePacket;
    const question = normalizeText(packet?.question?.text);
    if (!packet || typeof packet !== "object" || question.length < 4 || question.length > 500) {
      return reply(400,{ok:false,code:"QUESTION_REQUIRED",message:"언니한테 궁금한 걸 조금만 더 구체적으로 적어줘."});
    }
    if (unique(packet.allowedEvidenceIds).length < 4) {
      return reply(400,{ok:false,code:"INSUFFICIENT_EVIDENCE",message:"사주 근거가 충분히 준비되지 않았어. 다시 계산해줘."});
    }

    const model = String(context.env.OPENAI_MODEL || MODEL_DEFAULT).trim();
    const effort = ["low","medium","high"].includes(String(context.env.OPENAI_REASONING_EFFORT || "").trim())
      ? String(context.env.OPENAI_REASONING_EFFORT).trim()
      : "high";
    const encoded = JSON.stringify(packet);
    const basePayload = {
      model,
      store:false,
      reasoning:{effort},
      max_output_tokens:8000,
      input:[
        {role:"system",content:[{type:"input_text",text:SYSTEM_PROMPT}]},
        {role:"user",content:[{type:"input_text",text:
          "[사용자 질문]\n"+question+
          "\n\n[검증된 어떤언니 명리 엔진 근거]\n"+encoded+
          "\n\n먼저 질문을 그대로 이해해. 기존 6개 고민 분류는 사용하지 마. 사용자가 실제로 알고 싶은 것을 직접 답하고, centralThesis 하나를 세운 뒤 그 질문에 필요한 섹션만 동적으로 구성해. 답마다 실제 evidenceIds를 붙이고 반대 근거가 있으면 숨기지 마."
        }]}
      ],
      text:{format:{type:"json_schema",name:"unni_consultation_v1",strict:true,schema:OUTPUT_SCHEMA}},
    };

    async function call(correction="") {
      const payload = JSON.parse(JSON.stringify(basePayload));
      if (correction) payload.input[1].content[0].text += "\n\n[직전 검증 실패]\n"+correction+"\n새 사실을 만들지 말고 이 오류만 고쳐.";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(),65000);
      let response;
      try {
        response = await fetch("https://api.openai.com/v1/responses",{
          method:"POST",
          headers:{"content-type":"application/json",authorization:"Bearer "+context.env.OPENAI_API_KEY},
          body:JSON.stringify(payload),
          signal:controller.signal,
        });
      } catch(error) {
        return {ok:false,response:reply(error?.name==="AbortError"?504:502,{
          ok:false,
          code:error?.name==="AbortError"?"OPENAI_TIMEOUT":"OPENAI_NETWORK_ERROR",
          message:error?.name==="AbortError"?"상담을 깊게 보는 데 너무 오래 걸려 이번 요청을 종료했어. 한 번만 다시 눌러줘.":"상담 서버 연결이 잠깐 끊겼어. 다시 한 번 해줘.",
        })};
      } finally { clearTimeout(timeout); }
      let raw;
      try { raw=await response.json(); } catch { raw=null; }
      if (!response.ok) return {ok:false,response:reply(502,{ok:false,code:raw?.error?.code||"OPENAI_API_ERROR",message:raw?.error?.message||"상담을 생성하지 못했어."})};
      const text=extractOutputText(raw);
      if(!text) return {ok:false,response:reply(502,{ok:false,code:"OPENAI_EMPTY_OUTPUT",message:"상담 내용이 비어 있어. 다시 한 번 봐줘."})};
      let parsed;
      try { parsed=JSON.parse(text); } catch { return {ok:false,validationError:"OPENAI_INVALID_JSON",payload:raw}; }
      try { return {ok:true,payload:raw,result:validateOutput(parsed,packet)}; }
      catch(error){ return {ok:false,validationError:String(error?.message||"CONSULTATION_VALIDATION_FAILED"),payload:raw}; }
    }

    const usages=[];
    let attempts=1;
    let generated=await call();
    if(generated.payload?.usage) usages.push(generated.payload.usage);
    if(!generated.ok && !generated.response && generated.validationError){
      attempts=2;
      generated=await call(generated.validationError);
      if(generated.payload?.usage) usages.push(generated.payload.usage);
    }
    if(!generated.ok){
      if(generated.response) return generated.response;
      return reply(502,{ok:false,code:generated.validationError||"CONSULTATION_VALIDATION_FAILED",message:"상담 내용이 명리 근거 검증을 통과하지 못했어. 같은 질문으로 한 번만 다시 봐줘.",attempts});
    }

    const usage=usages.reduce((acc,row)=>{
      if(!acc) return JSON.parse(JSON.stringify(row));
      acc.input_tokens=Number(acc.input_tokens||0)+Number(row.input_tokens||0);
      acc.output_tokens=Number(acc.output_tokens||0)+Number(row.output_tokens||0);
      acc.total_tokens=Number(acc.total_tokens||0)+Number(row.total_tokens||0);
      acc.input_tokens_details=acc.input_tokens_details||{};
      acc.output_tokens_details=acc.output_tokens_details||{};
      acc.input_tokens_details.cached_tokens=Number(acc.input_tokens_details.cached_tokens||0)+Number(row.input_tokens_details?.cached_tokens||0);
      acc.output_tokens_details.reasoning_tokens=Number(acc.output_tokens_details.reasoning_tokens||0)+Number(row.output_tokens_details?.reasoning_tokens||0);
      return acc;
    },null);

    return reply(200,{
      ok:true,
      model,
      responseId:generated.payload?.id||"",
      attempts,
      usage,
      usageBreakdown:usageBreakdown(usage,model,context.env),
      ...generated.result,
    });
  } catch(error) {
    return reply(500,{ok:false,code:"SERVER_RUNTIME_ERROR",message:"상담 서버 처리 중 오류가 생겼어.",detail:String(error?.message||error||"").slice(0,300)});
  }
}
