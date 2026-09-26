(function (global) {
  "use strict";

  const VERSION = "1.0.0";
  const ENDPOINT = "/api/consultation";
  const MIN_QUESTION = 4;
  const MAX_QUESTION = 500;

  function cloneJson(value, fallback) {
    try { return JSON.parse(JSON.stringify(value ?? fallback)); }
    catch { return fallback; }
  }

  function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeQuestion(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, MAX_QUESTION);
  }

  function compactClaim(claim) {
    if (!claim || typeof claim !== "object") return null;
    return {
      id: claim.id || "",
      rawFacts: cloneJson(claim.rawFacts || {}, {}),
      ditianRuleIds: unique(claim.ditianRuleIds || []),
      zipingRuleIds: unique(claim.zipingRuleIds || []),
      conditions: cloneJson(claim.conditions || [], []),
      exceptions: cloneJson(claim.exceptions || [], []),
      causalSteps: cloneJson(claim.causalSteps || [], []),
      evidenceStatus: claim.evidenceStatus || "",
      certainty: claim.certainty || "",
      conclusion: claim.conclusion || "",
    };
  }

  function compactChartFacts(reasoning) {
    const profile = reasoning?.profile || {};
    const strength = profile?.strength || {};
    const elements = profile?.elements || {};
    const sipsin = profile?.sipsin || {};
    const structure = profile?.structure || {};
    const balance = profile?.balance || {};
    const context = reasoning?.context || {};
    return {
      pillars: cloneJson(profile?.pillars || {}, {}),
      dayMaster: {
        gan: context?.dayGan || profile?.pillars?.day?.gan || "",
        element: context?.dayElement || "",
        strength: strength?.verdict || "",
        extreme: strength?.extreme || null,
        supportRatio: strength?.supportRatio ?? null,
        supportForce: strength?.supportForce ?? null,
        drainForce: strength?.drainForce ?? null,
        deukryeong: cloneJson(strength?.deukryeong || null, null),
        deukji: cloneJson(strength?.deukji || null, null),
        deukse: cloneJson(strength?.deukse || null, null),
        roots: cloneJson(strength?.roots || [], []),
      },
      fiveElements: {
        rawCount: cloneJson(elements?.raw || {}, {}),
        weightedInfluence: cloneJson(elements?.influence || {}, {}),
        rawRank: cloneJson(Array.isArray(elements?.rawRank) ? elements.rawRank : [], []),
        weightedRank: cloneJson(
          Array.isArray(elements?.influenceRank)
            ? elements.influenceRank
            : Object.entries(elements?.influence || {})
                .map(([element, value]) => ({ element, value:Number(value || 0) }))
                .sort((a,b) => b.value - a.value),
          [],
        ),
        rawVsWeightedMismatch: elements?.rawVsInfluenceMismatch === true,
      },
      tenGods: {
        dominant: sipsin?.dominant || "",
        secondary: sipsin?.secondary || "",
        counts: cloneJson(sipsin?.counts || {}, {}),
        placements: cloneJson(sipsin?.all || [], []),
        occurrences: cloneJson(context?.godOccurrences || [], []),
      },
      structure: {
        gyeokName: structure?.gyeokName || "",
        gyeokSipsin: structure?.gyeokSipsin || "",
        basisGan: structure?.basisGan || "",
        basis: structure?.basis || "",
        status: structure?.status || "",
        flow: structure?.flow || "",
        sangsin: structure?.sangsin || "",
        gisin: structure?.gisin || "",
        touchul: structure?.touchul === true,
        branchType: structure?.branchType || "",
        saryeongGan: structure?.saryeongGan || "",
        hiddenGans: cloneJson(structure?.hiddenGans || [], []),
        visibleHidden: cloneJson(structure?.visibleHidden || [], []),
        candidates: cloneJson(structure?.candidates || [], []),
      },
      balance: {
        primaryYongshin: balance?.primary || "",
        secondaryYongshin: balance?.secondary || "",
        avoidElement: balance?.avoid || "",
        scores: cloneJson(balance?.scores || {}, {}),
        bridge: cloneJson(balance?.bridge || null, null),
        method: balance?.method || "",
      },
      relations: {
        clashes: cloneJson(context?.clashes || [], []),
        harms: cloneJson(context?.harms || [], []),
        breaks: cloneJson(context?.breaks || [], []),
        punishments: cloneJson(context?.punishments || [], []),
        stemCombines: cloneJson(context?.stemCombines || [], []),
        branchCombines: cloneJson(context?.branchCombines || [], []),
        branchTriads: cloneJson(context?.branchTriads || [], []),
        branchHalfTriads: cloneJson(context?.branchHalfTriads || [], []),
      },
      groupForces: cloneJson(context?.groupForces || {}, {}),
      elementRanking: cloneJson(context?.elementRanking || [], []),
      rawRanking: cloneJson(context?.rawRanking || [], []),
    };
  }

  function timingSignalSummary(signal) {
    if (!signal || typeof signal !== "object") return null;
    return {
      code: signal.code || "",
      severity: signal.severity || "",
      reason: signal.reason || "",
      facts: cloneJson(signal.facts || {}, {}),
      sourceRuleIds: unique(signal.sourceRuleIds || []),
    };
  }

  function timingLayerSummary(layer) {
    if (!layer || typeof layer !== "object") return null;
    return {
      layer: layer.layer || "",
      ganZhi: layer.ganZhi || "",
      god: layer.god || "",
      group: layer.group || "",
      supportSignals: (layer.supportSignals || []).map(timingSignalSummary).filter(Boolean),
      cautionSignals: (layer.cautionSignals || []).map(timingSignalSummary).filter(Boolean),
      neutralSignals: (layer.neutralSignals || []).map(timingSignalSummary).filter(Boolean).slice(0,4),
      relations: cloneJson(layer.relations || [], []),
    };
  }

  function timingRowSummary(row) {
    if (!row || typeof row !== "object") return null;
    return {
      date: row.date || row.startYmd || "",
      startYmd: row.startYmd || "",
      endYmd: row.endYmd || "",
      year: row.year ?? null,
      month: row.month ?? null,
      class: row.class || "neutral",
      evidence: cloneJson(row.evidence || {}, {}),
      daeunGanZhi: row.daeunGanZhi || "",
      seyounGanZhi: row.seyounGanZhi || row.seyunGanZhi || "",
      layers: {
        daeun: timingLayerSummary(row.layers?.daeun),
        seyun: timingLayerSummary(row.layers?.seyun),
        wolun: timingLayerSummary(row.layers?.wolun),
      },
      sourceRuleIds: unique(row.sourceRuleIds || []),
      pivotReasons: cloneJson(row.pivotReasons || [], []),
      isStructuralPivot: row.isStructuralPivot === true,
    };
  }

  function collectTimingIds(rows) {
    const ids = [];
    for (const row of rows || []) {
      ids.push(...(row?.sourceRuleIds || []));
      for (const layer of [row?.layers?.daeun,row?.layers?.seyun,row?.layers?.wolun]) {
        for (const signal of [
          ...(layer?.supportSignals || []),
          ...(layer?.cautionSignals || []),
          ...(layer?.neutralSignals || []),
        ]) ids.push(...(signal?.sourceRuleIds || []));
      }
    }
    return unique(ids);
  }

  function consultationHistory(data) {
    const prior = Array.isArray(data?.consultationHistory) ? data.consultationHistory.slice(-3) : [];
    const current = data?.__consultationV1;
    if (current?.directAnswer || current?.centralThesis) {
      prior.push({
        question: normalizeQuestion(data?.userQuestion || ""),
        directAnswer: String(current?.directAnswer?.answer || "").replace(/\s+/g," ").trim().slice(0,500),
        centralThesis: String(current?.centralThesis?.answer || current?.centralThesis?.summary || "").replace(/\s+/g," ").trim().slice(0,500),
      });
    }
    const seen=new Set();
    return prior
      .map((row)=>({
        question:normalizeQuestion(row?.question || ""),
        directAnswer:String(row?.directAnswer || "").replace(/\s+/g," ").trim().slice(0,500),
        centralThesis:String(row?.centralThesis || "").replace(/\s+/g," ").trim().slice(0,500),
      }))
      .filter((row)=>{
        if(!row.question || seen.has(row.question)) return false;
        seen.add(row.question); return true;
      })
      .slice(-4);
  }

  function buildEvidencePacket(data, mode) {
    const question = normalizeQuestion(data?.userQuestion || data?.question || "");
    if (question.length < MIN_QUESTION) {
      const e = new Error("QUESTION_TOO_SHORT");
      e.code = "QUESTION_TOO_SHORT";
      throw e;
    }
    if (typeof global.buildClassicalReasoningV1 !== "function") {
      const e = new Error("CLASSICAL_REASONING_ENGINE_MISSING");
      e.code = "CLASSICAL_REASONING_ENGINE_MISSING";
      throw e;
    }

    const reasoning = data?.classicalReasoningV1 || global.buildClassicalReasoningV1(data || {});
    const synthesis = reasoning?.synthesis || {};
    const timing = reasoning?.timing || {};
    const near = timing?.concernNearTerm || {};
    const nearRows = (near.highlights || []).map(timingRowSummary).filter(Boolean).slice(0,10);
    const salientRows = (timing.salientMonths || []).map(timingRowSummary).filter(Boolean).slice(0,10);
    const pivotRows = (timing.longTermPivots || []).map(timingRowSummary).filter(Boolean).slice(0,4);
    const timingRows = [...nearRows,...salientRows,...pivotRows];
    const timingEvidenceIds = collectTimingIds(timingRows);

    const signals = (synthesis.signals || []).map((signal) => ({
      id: signal.id || "",
      system: signal.system || "",
      kind: signal.kind || "",
      salience: signal.salience ?? null,
      polarity: signal.polarity || "",
      conclusion: signal.conclusion || "",
      facts: cloneJson(signal.facts || {}, {}),
      conditions: cloneJson(signal.conditions || [], []),
      exceptions: cloneJson(signal.exceptions || [], []),
      state: signal.state || null,
      supportGods: cloneJson(signal.supportGods || [], []),
      harmGods: cloneJson(signal.harmGods || [], []),
      rescueGods: cloneJson(signal.rescueGods || [], []),
      causalSteps: cloneJson(signal.causalSteps || [], []),
    })).filter((x) => x.id || x.conclusion);

    const claims = (reasoning.claims || []).map(compactClaim).filter(Boolean);
    const ruleIds = claims.flatMap((claim) => [
      ...(claim.ditianRuleIds || []),
      ...(claim.zipingRuleIds || []),
    ]);
    const signalIds = signals.map((s) => s.id).filter(Boolean);
    const chartIds = [
      "CHART_PILLARS","CHART_ELEMENTS","CHART_STRENGTH","CHART_TENGODS",
      "CHART_STRUCTURE","CHART_RELATIONS","CHART_BALANCE","CHART_FLOW",
    ];
    const allowedEvidenceIds = unique([...chartIds,...signalIds,...ruleIds,...timingEvidenceIds]);

    return {
      schemaVersion: VERSION,
      requestMode: mode === "T" ? "T" : "F",
      question: {
        text: question,
        instruction:
          "사용자의 말을 기존 고민 카테고리에 억지로 넣지 말고, 실제로 답해야 할 하위질문을 먼저 분해한다.",
      },
      conversationContext: {
        previousConsultations: consultationHistory(data),
        instruction:
          "앞선 상담은 대화 연속성을 위한 맥락일 뿐 새로운 명리 근거가 아니다. 새 질문의 결론은 반드시 이번 evidence에서 다시 검증한다.",
      },
      structureFingerprint: reasoning.structureFingerprint || "",
      timingFingerprint: reasoning.timingFingerprint || "",
      chartFacts: compactChartFacts(reasoning),
      synthesis: {
        mechanisms: cloneJson(synthesis.mechanisms || {}, {}),
        priorityMechanisms: cloneJson(synthesis.priorityMechanisms || [], []),
        contradictionFlags: cloneJson(synthesis.contradictionFlags || [], []),
        signals,
        tenGodEvidence: cloneJson((synthesis.tenGodEvidence || []).slice(0,16), []),
        evidencePlan: cloneJson(synthesis.evidencePlan || {}, {}),
        guarded: synthesis.guarded === true,
      },
      crossValidation: {
        strength: reasoning.integrated?.strength || "",
        rootQuality: reasoning.integrated?.rootQuality || "",
        pressureGroup: reasoning.integrated?.pressureGroup || "",
        helpfulGods: cloneJson(reasoning.integrated?.helpfulGods || [], []),
        rescueGods: cloneJson(reasoning.integrated?.rescueGods || [], []),
        harmfulGods: cloneJson(reasoning.integrated?.harmfulGods || [], []),
        structuralSupportGods: cloneJson(reasoning.integrated?.structuralSupportGods || [], []),
        structuralRescueGods: cloneJson(reasoning.integrated?.structuralRescueGods || [], []),
        structuralHarmGods: cloneJson(reasoning.integrated?.structuralHarmGods || [], []),
        bridgeElement: reasoning.integrated?.bridgeElement || null,
        bridgeStatus: reasoning.integrated?.bridgeStatus || null,
        blockedFlowElement: reasoning.integrated?.blockedFlowElement || null,
        zipingState: reasoning.integrated?.zipingState || "",
        zipingPath: reasoning.integrated?.zipingPath || null,
        conflicts: cloneJson(reasoning.integrated?.conflicts || [], []),
        priorityPolicy: reasoning.integrated?.priorityPolicy || "",
        prescription: cloneJson(reasoning.integrated?.prescription || {}, {}),
        specialStructureGuarded: reasoning.integrated?.specialStructureGuarded === true,
      },
      claims,
      timingEvidence: {
        today: timing.today || "",
        detailEnd: timing.detailEnd || "",
        horizonEnd: timing.horizonEnd || "",
        highlights: nearRows,
        salientMonths: salientRows,
        structuralPivots: pivotRows,
      },
      unsupported: cloneJson(reasoning.unsupported || [], []),
      allowedEvidenceIds,
      timingEvidenceIds,
      privacy: {
        includesName: false,
        includesBirthDate: false,
        includesBirthTime: false,
        includesQuestionText: true,
      },
    };
  }

  function runtimeKey(packet, mode) {
    return [
      VERSION,
      packet?.structureFingerprint || "",
      packet?.timingFingerprint || "",
      normalizeQuestion(packet?.question?.text || "").toLowerCase(),
      mode === "T" ? "T" : "F",
    ].join("|");
  }

  async function requestConsultation(data, mode) {
    const packet = buildEvidencePacket(data, mode);
    const response = await fetch(ENDPOINT, {
      method:"POST",
      headers:{"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify({ evidencePacket:packet }),
      cache:"no-store",
      credentials:"same-origin",
      referrerPolicy:"strict-origin-when-cross-origin",
    });
    const raw = await response.text();
    let payload = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch {}
    if (!response.ok || !payload?.ok) {
      const error = new Error(payload?.message || "상담 생성에 실패했어.");
      error.code = payload?.code || "CONSULTATION_HTTP_" + response.status;
      error.detail = payload?.detail || raw.slice(0,180);
      throw error;
    }
    return { ...payload, evidencePacket:packet };
  }

  function detailBlock(label, content, nested) {
    if (!content) return "";
    return '<details class="note-detail consultation-evidence"><summary>'+escapeHtml(label)+'</summary><div class="note-detail-body consultation-evidence-copy">'+
      content + (nested || "") + '</div></details>';
  }

  function renderTechnicalBasis(text, evidenceIds) {
    const basis = escapeHtml(text || "").replace(/\n/g,"<br>");
    if (!basis) return "";
    // 내부 rule/evidence ID는 사용자에게 노출하지 않고 카드 메타데이터에만 보존한다.
    return detailBlock("명리 근거까지 보기", basis);
  }

  function cardFromClaim(kind, claim, index, total) {
    const answer = escapeHtml(claim?.answer || claim?.summary || "").replace(/\n{2,}/g,"<br><br>").replace(/\n/g,"<br>");
    const why = escapeHtml(claim?.why || "").replace(/\n{2,}/g,"<br><br>").replace(/\n/g,"<br>");
    const technical = renderTechnicalBasis(claim?.technicalBasis || "", claim?.evidenceIds || []);
    const whyBlock = why ? detailBlock("왜 그렇게 봤어?", why, technical) : technical;
    return {
      badge: kind === "answer" ? "네 질문의 답" : "언니가 먼저 본 것",
      themeNum: String(index).padStart(2,"0"),
      title: escapeHtml(claim?.headline || claim?.title || (kind === "answer" ? "네 질문부터 답할게" : "사주 전체에서 먼저 보이는 것")),
      desc: [answer,whyBlock].filter(Boolean).join("<br><br>"),
      checklist:"",
      __consultationV1:true,
      __sectionType:kind,
      __evidenceRuleIds:unique(claim?.evidenceIds || []),
      __counterEvidenceIds:unique(claim?.counterEvidenceIds || []),
      __certainty:claim?.certainty || "guarded",
      __total:total,
    };
  }

  function mapToCards(result) {
    const rawSections = Array.isArray(result?.sections) ? result.sections : [];
    const total = 2 + rawSections.length;
    const cards = [
      cardFromClaim("answer", result?.directAnswer || {}, 1, total),
      cardFromClaim("thesis", result?.centralThesis || {}, 2, total),
    ];
    rawSections.forEach((section, i) => {
      const answer = escapeHtml(section?.answer || "").replace(/\n{2,}/g,"<br><br>").replace(/\n/g,"<br>");
      const why = escapeHtml(section?.why || "").replace(/\n{2,}/g,"<br><br>").replace(/\n/g,"<br>");
      const technical = renderTechnicalBasis(section?.technicalBasis || "", section?.evidenceIds || []);
      const whyBlock = why ? detailBlock("왜 그렇게 봤어?", why, technical) : technical;
      cards.push({
        badge: escapeHtml(section?.label || "이어볼 것"),
        themeNum:String(i+3).padStart(2,"0"),
        title:escapeHtml(section?.title || ""),
        desc:[answer,whyBlock].filter(Boolean).join("<br><br>"),
        checklist: section?.nextAction ? escapeHtml(section.nextAction) : "",
        __consultationV1:true,
        __sectionType:section?.type || "dynamic",
        __evidenceRuleIds:unique(section?.evidenceIds || []),
        __counterEvidenceIds:unique(section?.counterEvidenceIds || []),
        __certainty:section?.certainty || "guarded",
        __timingQA: section?.type === "timing" ? { consultationV1:true } : undefined,
      });
    });
    return cards;
  }

  const inflight = new Map();

  async function generate(data, mode) {
    const normalizedMode = mode === "T" ? "T" : "F";
    const packet = buildEvidencePacket(data, normalizedMode);
    const key = runtimeKey(packet, normalizedMode);
    if (data?.__consultationV1?.key === key && Array.isArray(data.__consultationV1.cards)) {
      return data.__consultationV1;
    }
    if (inflight.has(key)) return inflight.get(key);
    const promise = requestConsultation(data, normalizedMode)
      .then((result) => {
        if (result?.questionPlan?.needsClarification && result?.questionPlan?.clarifyingQuestion) {
          const error = new Error(result.questionPlan.clarifyingQuestion);
          error.code = "CONSULTATION_CLARIFICATION_REQUIRED";
          error.clarifyingQuestion = result.questionPlan.clarifyingQuestion;
          throw error;
        }
        const cards = mapToCards(result);
        if (cards.length < 4 || cards.length > 9) {
          const error = new Error("CONSULTATION_SECTION_COUNT_INVALID");
          error.code = "CONSULTATION_SECTION_COUNT_INVALID";
          throw error;
        }
        const stored = {
          key,
          version:VERSION,
          generatedAt:new Date().toISOString(),
          model:result?.model || "",
          questionPlan:cloneJson(result?.questionPlan || {}, {}),
          centralThesis:cloneJson(result?.centralThesis || {}, {}),
          directAnswer:cloneJson(result?.directAnswer || {}, {}),
          sections:cloneJson(result?.sections || [], []),
          cards,
          usageBreakdown:cloneJson(result?.usageBreakdown || null, null),
        };
        data.__consultationV1 = stored;
        return stored;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key,promise);
    return promise;
  }

  function getCards(data, mode) {
    try {
      const packet = buildEvidencePacket(data, mode);
      const key = runtimeKey(packet, mode);
      return data?.__consultationV1?.key === key ? data.__consultationV1.cards || null : null;
    } catch { return null; }
  }

  function getTermContext(data, term) {
    const reasoning = data?.classicalReasoningV1 || null;
    if (!reasoning) return "";
    const row = (reasoning?.synthesis?.tenGodEvidence || []).find((x) => x?.god === term);
    if (row) {
      const weight = Number(row.weight || 0);
      return "이번 사주에서 "+term+"은 실제 세력 "+weight.toFixed(2)+"로 계산돼. 다른 십신·강약·격국과 함께 해석했어.";
    }
    return "";
  }

  global.__UNNI_CONSULTATION_V1__ = {
    version:VERSION,
    endpoint:ENDPOINT,
    minQuestionLength:MIN_QUESTION,
    maxQuestionLength:MAX_QUESTION,
    normalizeQuestion,
    buildEvidencePacket,
    requestConsultation,
    mapToCards,
    generate,
    getCards,
    describeTerm:getTermContext,
    historyFrom:consultationHistory,
  };
})(globalThis);
