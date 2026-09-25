(function (global) {
  "use strict";

  const VERSION = "2.2.0";
  const TEST_PARAM = "ai_notes_test";
  const TEST_PANEL_ID = "aiNotesTestPanel";
  const ENDPOINT = "/api/ai-notes";

  function testEnabled() {
    try {
      const live = new URLSearchParams(global.location.search || "");
      if (live.get(TEST_PARAM) === "1") return true;
      const preserved = new URLSearchParams(global.unniReturnParams || "");
      return preserved.get(TEST_PARAM) === "1";
    } catch {
      return false;
    }
  }

  // 실시간 AI NOTE는 호출당 비용이 커서 결과 화면에서 자동으로 부르지 않는다.
  // ?ai_notes_test=1 테스트 패널에서 버튼을 눌렀을 때만 호출한다.
  function autoProductionEnabled() {
    return false;
  }

  function cloneJson(value, fallback) {
    try {
      return JSON.parse(JSON.stringify(value ?? fallback));
    } catch {
      return fallback;
    }
  }

  function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  const ROLE_TO_ENGINE_ROLE = {
    foundation: "core",
    mechanism: "pattern",
    fit: "fit",
    caution: "caution",
    timing: "timing",
  };

  const ROLE_CHART_EVIDENCE = {
    foundation: ["CHART_ELEMENTS", "CHART_STRENGTH", "CHART_TENGODS", "CHART_STRUCTURE"],
    mechanism: ["CHART_STRENGTH", "CHART_TENGODS", "CHART_RELATIONS"],
    fit: ["CHART_TENGODS", "CHART_STRUCTURE", "CHART_BALANCE"],
    caution: ["CHART_TENGODS", "CHART_RELATIONS", "CHART_STRENGTH"],
    timing: ["CHART_STRENGTH", "CHART_STRUCTURE", "CHART_RELATIONS"],
  };

  function buildNotePlan(reasoning, timingEvidenceIds, timingRows) {
    const synthesis = reasoning?.synthesis || {};
    const chart = compactChartFacts(reasoning);
    const evidenceRoles = synthesis?.evidencePlan?.roles || {};
    const topGod = (synthesis?.tenGodEvidence || [])[0] || null;
    const mechanism = synthesis?.mechanisms || {};
    const rolePlan = {};

    for (const role of Object.keys(ROLE_TO_ENGINE_ROLE)) {
      const engineRole = ROLE_TO_ENGINE_ROLE[role];
      const ruleIds = unique(evidenceRoles?.[engineRole] || []).slice(0, 4);
      const required = unique([
        ...(ROLE_CHART_EVIDENCE[role] || []),
        ...ruleIds,
        ...(role === "timing" ? unique(timingEvidenceIds).slice(0, 2) : []),
      ]);
      rolePlan[role] = {
        requiredEvidenceIds: required,
        factDigest: {},
      };
    }

    rolePlan.foundation.factDigest = {
      dayMaster: {
        gan: chart.dayMaster?.gan || "",
        element: chart.dayMaster?.element || "",
        strength: chart.dayMaster?.strength || "",
        deukryeong: chart.dayMaster?.deukryeong || null,
        deukji: chart.dayMaster?.deukji || null,
        deukse: chart.dayMaster?.deukse || null,
        rootCount: (chart.dayMaster?.roots || []).length,
      },
      fiveElements: {
        rawCount: chart.fiveElements?.rawCount || {},
        weightedRank: (chart.fiveElements?.weightedRank || []).slice(0, 5),
        rawVsWeightedMismatch: chart.fiveElements?.rawVsWeightedMismatch === true,
      },
      dominantTenGod: topGod
        ? {
            god: topGod.god || "",
            group: topGod.group || "",
            weight: topGod.weight ?? null,
            visibleWeight: topGod.visibleWeight ?? null,
            hiddenWeight: topGod.hiddenWeight ?? null,
            roles: topGod.roles || [],
          }
        : null,
      structure: {
        gyeokName: chart.structure?.gyeokName || "",
        status: chart.structure?.status || "",
        sangsin: chart.structure?.sangsin || "",
        gisin: chart.structure?.gisin || "",
        touchul: chart.structure?.touchul === true,
      },
    };
    rolePlan.mechanism.factDigest = {
      capacity: {
        verdict: mechanism.capacity?.verdict || "",
        rootQuality: mechanism.capacity?.rootQuality || "",
        rootCount: mechanism.capacity?.rootCount ?? null,
        rootClashCount: mechanism.capacity?.rootClashCount ?? null,
        seasonSupported: mechanism.capacity?.seasonSupported === true,
        partySupported: mechanism.capacity?.partySupported === true,
      },
      drive: {
        strongestElement: mechanism.drive?.strongestElement || "",
        rawStrongest: mechanism.drive?.rawStrongest || "",
        rawInfluenceMismatch: mechanism.drive?.rawInfluenceMismatch === true,
        blockedAt: mechanism.drive?.blockedAt || null,
        pressureGroup: mechanism.drive?.pressureGroup || "",
        pressureOverload: mechanism.drive?.pressureOverload === true,
      },
      friction: mechanism.friction || {},
      contradictionFlags: synthesis?.contradictionFlags || [],
    };
    rolePlan.fit.factDigest = {
      helpfulGods: mechanism.structure?.helpfulGods || [],
      rescueGods: mechanism.structure?.rescueGods || [],
      zipingState: mechanism.structure?.state || "",
      zipingPath: mechanism.structure?.path || null,
      bridgeElement: mechanism.adjustment?.bridgeElement || null,
      bridgeStatus: mechanism.adjustment?.bridgeStatus || null,
      prescriptionSequence: (mechanism.adjustment?.prescription?.sequence || []).map((x) => x?.element).filter(Boolean),
    };
    rolePlan.caution.factDigest = {
      harmfulGods: mechanism.structure?.harmfulGods || [],
      pressureGroup: mechanism.drive?.pressureGroup || "",
      pressureOverload: mechanism.drive?.pressureOverload === true,
      conflictCount: (mechanism.adjustment?.conflicts || []).length,
      rootClashCount: mechanism.capacity?.rootClashCount ?? null,
      friction: mechanism.friction || {},
    };
    rolePlan.timing.factDigest = {
      natalStrength: chart.dayMaster?.strength || "",
      natalStructure: chart.structure?.gyeokName || "",
      rows: (timingRows || []).slice(0, 5).map((row) => ({
        startYmd: row?.startYmd || row?.date || "",
        endYmd: row?.endYmd || "",
        class: row?.class || "",
        daeunGanZhi: row?.daeunGanZhi || "",
        seyounGanZhi: row?.seyounGanZhi || "",
        majorSupport: Number(row?.evidence?.majorSupport || 0),
        support: Number(row?.evidence?.support || 0),
        majorCaution: Number(row?.evidence?.majorCaution || 0),
        caution: Number(row?.evidence?.caution || 0),
        wolunSupportCodes: (row?.layers?.wolun?.supportSignals || []).map((x) => x?.code).filter(Boolean),
        wolunCautionCodes: (row?.layers?.wolun?.cautionSignals || []).map((x) => x?.code).filter(Boolean),
      })),
    };

    const requiredEvidenceCoverageIds = unique([
      ...Object.values(rolePlan).flatMap((row) => row.requiredEvidenceIds || []),
      ...(synthesis?.priorityMechanisms || []).slice(0, 6).map((row) => row?.ruleId).filter(Boolean),
    ]);

    return { rolePlan, requiredEvidenceCoverageIds };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function runtimeKey(data, mode) {
    const diagnosis = data?.noteDiagnosisV2 || {};
    const reasoning = diagnosis?.reasoning || data?.classicalReasoningV1 || {};
    return [
      VERSION,
      reasoning?.structureFingerprint || diagnosis?.structureFingerprint || "",
      reasoning?.timingFingerprint || diagnosis?.timingFingerprint || "",
      data?.concernKey || "",
      data?.concernSituation || "",
      mode === "T" ? "T" : "F",
    ].join("|");
  }

  function buildTermContext(packet) {
    const out = {};
    for (const row of packet?.synthesis?.tenGodEvidence || []) {
      if (!row?.god) continue;
      const where = Number(row.visibleWeight || 0) > Number(row.hiddenWeight || 0) * 1.15
        ? "겉으로 드러난 자리의 비중이 더 커"
        : Number(row.hiddenWeight || 0) > Number(row.visibleWeight || 0) * 1.15
          ? "지장간처럼 안쪽에 숨어 있는 비중이 더 커"
          : "겉과 안쪽 비중이 비슷해";
      const roles = Array.isArray(row.roles) && row.roles.length
        ? " 구조상 역할은 " + row.roles.join("·") + "로 잡혀 있어."
        : "";
      out[row.god] = "이번 사주에서는 실제 가중치 " + Number(row.weight || 0).toFixed(2) + "로 계산되고, " + where + "." + roles;
    }
    const strength = packet?.crossValidation?.strength;
    if (strength) {
      const root = packet?.crossValidation?.rootQuality || "확인 중";
      out[strength] = "이번 사주는 " + strength + "으로 계산됐고, 뿌리 상태는 " + root + "로 잡혀 있어.";
    }
    const gyeok = packet?.chartFacts?.structure?.gyeokName;
    if (gyeok) {
      out[gyeok] = "이번 사주에서는 태어난 달의 구조를 기준으로 " + gyeok + "으로 판정돼.";
    }
    const structure = packet?.chartFacts?.structure || {};
    if (structure.sangsin) out.상신 = "이번 사주에서 상신으로 잡힌 십신은 " + structure.sangsin + "이야.";
    if (structure.gisin) out.기신 = "이번 사주에서 기신으로 잡힌 십신은 " + structure.gisin + "이야.";
    const roots = packet?.chartFacts?.dayMaster?.roots || [];
    if (roots.length) out.통근 = "이번 사주에서는 일간의 뿌리가 " + roots.length + "곳에서 확인돼.";
    return out;
  }

  function mapAiNotesToProduction(result, data, mode) {
    const meta = {
      foundation: { badge: "핵심", themeNum: "01" },
      mechanism: { badge: "실제 장면", themeNum: "02" },
      fit: { badge: "잘 맞는 조건", themeNum: "03" },
      caution: { badge: "거를 신호", themeNum: "04" },
      timing: { badge: "가까운 흐름", themeNum: "05" },
    };
    return (result?.notes || []).map((note) => {
      const m = meta[note.role] || { badge: "핵심", themeNum: "01" };
      const safeBasis = escapeHtml(note.basis);
      const safeBody = escapeHtml(note.body).replace(/\n{2,}/g, "<br><br>").replace(/\n/g, "<br>");
      return {
        badge: m.badge,
        themeNum: m.themeNum,
        title: escapeHtml(note.title),
        desc: "<b>사주 근거</b> — " + safeBasis + "<br><br>" + safeBody,
        checklist: "",
        __aiTranslated: true,
        __aiRole: note.role,
        __evidenceRuleIds: unique(note.evidenceIds || []),
        __personalizationFacts: { aiTranslated: true, evidenceIds: unique(note.evidenceIds || []) },
        ...(note.role === "timing" ? { __timingQA: { aiTranslated: true } } : {}),
      };
    }).sort((a, b) => Number(a.themeNum) - Number(b.themeNum));
  }

  const productionInflight = new Map();
  const productionAttemptState = new WeakMap();

  function productionState(data) {
    if (!data || typeof data !== "object") return null;
    let state = productionAttemptState.get(data);
    if (!state) {
      state = { attempts: 0, lastAttemptAt: 0, lastError: "", success: false };
      productionAttemptState.set(data, state);
    }
    return state;
  }

  function productionAiEnabled() {
    return testEnabled();
  }

  function canAttemptProductionNotes(data) {
    if (!productionAiEnabled()) return false;
    if (getProductionNotes(data, data?.currentMode || "F")?.length) return false;
    const state = productionState(data);
    if (!state) return false;
    if (state.success) return false;
    if (state.attempts === 0) return true;
    if (state.attempts >= 2) return false;
    return Date.now() - state.lastAttemptAt >= 4000;
  }

  function productionNoteStatus(data) {
    const state = productionState(data);
    return state
      ? { ...state, hasNotes: !!getProductionNotes(data, data?.currentMode || "F")?.length }
      : { attempts: 0, lastAttemptAt: 0, lastError: "", success: false, hasNotes: false };
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
      supportSignals: (layer.supportSignals || [])
        .map(timingSignalSummary)
        .filter(Boolean),
      cautionSignals: (layer.cautionSignals || [])
        .map(timingSignalSummary)
        .filter(Boolean),
      neutralSignals: (layer.neutralSignals || [])
        .map(timingSignalSummary)
        .filter(Boolean)
        .slice(0, 4),
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

  function collectTimingEvidenceIds(rows) {
    const out = [];
    for (const row of rows || []) {
      out.push(...(row?.sourceRuleIds || []));
      for (const layerName of ["daeun", "seyun", "wolun"]) {
        const layer = row?.layers?.[layerName];
        for (const signal of [
          ...(layer?.supportSignals || []),
          ...(layer?.cautionSignals || []),
          ...(layer?.neutralSignals || []),
        ]) {
          out.push(...(signal?.sourceRuleIds || []));
        }
      }
    }
    return unique(out);
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
                .map(([element, value]) => ({ element, value: Number(value || 0) }))
                .sort((a, b) => b.value - a.value),
          [],
        ),
        rawVsWeightedMismatch: elements?.rawVsInfluenceMismatch === true,
        note:
          "rawCount는 겉으로 보이는 천간·지지 개수이고 weightedInfluence는 월령·지장간·자리 가중치를 반영한 해석값이다. 0개/1개만 보고 결론내리지 않는다.",
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

  function buildEvidencePacket(data, mode) {
    if (typeof global.buildConcernDiagnosisV2 !== "function") {
      throw new Error("CONCERN_DIAGNOSIS_ENGINE_MISSING");
    }

    const diagnosis = global.buildConcernDiagnosisV2(data || {});
    const reasoning = diagnosis.reasoning || {};
    const synthesis = reasoning.synthesis || {};
    const timing = reasoning.timing || {};
    const near = timing.concernNearTerm || {};

    const highlightRows = (near.highlights || [])
      .map(timingRowSummary)
      .filter(Boolean)
      .slice(0, 8);
    const salientRows = (timing.salientMonths || [])
      .map(timingRowSummary)
      .filter(Boolean)
      .slice(0, 8);
    const pivotRows = (timing.longTermPivots || [])
      .map(timingRowSummary)
      .filter(Boolean)
      .slice(0, 3);

    const timingRows = [...highlightRows, ...salientRows, ...pivotRows];
    const timingEvidenceIds = collectTimingEvidenceIds(timingRows);

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
    }));

    const claims = (reasoning.claims || []).map(compactClaim).filter(Boolean);
    const ruleIdsFromClaims = claims.flatMap((claim) => [
      ...(claim.ditianRuleIds || []),
      ...(claim.zipingRuleIds || []),
    ]);

    const chartEvidenceIds = [
      "CHART_PILLARS",
      "CHART_ELEMENTS",
      "CHART_STRENGTH",
      "CHART_TENGODS",
      "CHART_STRUCTURE",
      "CHART_RELATIONS",
      "CHART_BALANCE",
    ];

    const allowedEvidenceIds = unique([
      ...chartEvidenceIds,
      ...signals.map((signal) => signal.id),
      ...ruleIdsFromClaims,
      ...timingEvidenceIds,
    ]);
    const { rolePlan: notePlan, requiredEvidenceCoverageIds } = buildNotePlan(
      reasoning,
      timingEvidenceIds,
      timingRows,
    );

    return {
      schemaVersion: VERSION,
      requestMode: mode === "T" ? "T" : "F",
      question: {
        concern: diagnosis.situation?.concern || "",
        situationKey: diagnosis.situation?.key || "",
        situationLabel: diagnosis.situation?.label || "",
        situationObject: diagnosis.situation?.object || "",
        instruction:
          "이 선택값은 답변 범위와 현실 번역의 초점만 정하며 명리 근거의 우선순위를 미리 정하지 않는다.",
      },
      structureFingerprint: reasoning.structureFingerprint || "",
      timingFingerprint: reasoning.timingFingerprint || "",
      chartFacts: compactChartFacts(reasoning),
      synthesis: {
        mechanisms: cloneJson(synthesis.mechanisms || {}, {}),
        priorityMechanisms: cloneJson(synthesis.priorityMechanisms || [], []),
        contradictionFlags: cloneJson(synthesis.contradictionFlags || [], []),
        signals,
        tenGodEvidence: cloneJson((synthesis.tenGodEvidence || []).slice(0, 12), []),
        guarded: synthesis.guarded === true,
      },
      crossValidation: {
        strength: reasoning.integrated?.strength || "",
        rootQuality: reasoning.integrated?.rootQuality || "",
        pressureGroup: reasoning.integrated?.pressureGroup || "",
        helpfulGods: cloneJson(reasoning.integrated?.helpfulGods || [], []),
        rescueGods: cloneJson(reasoning.integrated?.rescueGods || [], []),
        harmfulGods: cloneJson(reasoning.integrated?.harmfulGods || [], []),
        structuralSupportGods: cloneJson(
          reasoning.integrated?.structuralSupportGods || [],
          [],
        ),
        structuralRescueGods: cloneJson(
          reasoning.integrated?.structuralRescueGods || [],
          [],
        ),
        structuralHarmGods: cloneJson(
          reasoning.integrated?.structuralHarmGods || [],
          [],
        ),
        bridgeElement: reasoning.integrated?.bridgeElement || null,
        bridgeStatus: reasoning.integrated?.bridgeStatus || null,
        blockedFlowElement: reasoning.integrated?.blockedFlowElement || null,
        zipingState: reasoning.integrated?.zipingState || "",
        zipingPath: reasoning.integrated?.zipingPath || null,
        conflicts: cloneJson(reasoning.integrated?.conflicts || [], []),
        priorityPolicy: reasoning.integrated?.priorityPolicy || "",
        prescription: cloneJson(reasoning.integrated?.prescription || {}, {}),
        specialStructureGuarded:
          reasoning.integrated?.specialStructureGuarded === true,
      },
      claims,
      timingEvidence: {
        today: timing.today || "",
        detailEnd: timing.detailEnd || "",
        horizonEnd: timing.horizonEnd || "",
        highlights: highlightRows,
        salientMonths: salientRows,
        structuralPivots: pivotRows,
      },
      unsupported: cloneJson(reasoning.unsupported || [], []),
      notePlan,
      requiredEvidenceCoverageIds,
      allowedEvidenceIds,
      timingEvidenceIds,
      privacy: {
        includesName: false,
        includesBirthDate: false,
        includesBirthTime: false,
        includesContactInfo: false,
      },
    };
  }

  async function checkAiEndpoint() {
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin",
      });
    } catch {
      const error = new Error("AI NOTE 서버에 연결할 수 없습니다.");
      error.code = "AI_ENDPOINT_NETWORK_ERROR";
      throw error;
    }

    const raw = await response.text();
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!response.ok || !payload?.ok) {
      const error = new Error(
        payload?.message ||
          "AI NOTE 서버가 아직 정상 배포되지 않았습니다. HTTP " +
            response.status,
      );
      error.code =
        payload?.code || "AI_ENDPOINT_HTTP_" + String(response.status || 0);
      error.detail = payload?.detail || raw.slice(0, 160);
      throw error;
    }

    if (!payload.testEnabled) {
      const error = new Error("서버의 OPENAI_AI_NOTE_TEST_ENABLED=1일 때만 AI NOTE 테스트를 실행할 수 있습니다.");
      error.code = "AI_NOTE_TEST_DISABLED";
      throw error;
    }

    if (!payload.configured) {
      const error = new Error("Cloudflare의 OPENAI_API_KEY 설정을 확인해야 합니다.");
      error.code = "OPENAI_API_KEY_MISSING";
      throw error;
    }

    return payload;
  }

  async function generateAiNotes(data, mode) {
    const evidencePacket = buildEvidencePacket(data, mode);

    // Free preflight: if the Pages Function is not healthy, stop before spending OpenAI credits.
    await checkAiEndpoint();

    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ evidencePacket }),
        cache: "no-store",
        credentials: "same-origin",
        referrerPolicy: "strict-origin-when-cross-origin",
      });
    } catch {
      const error = new Error("AI NOTE 서버 호출에 실패했습니다.");
      error.code = "AI_NOTE_NETWORK_ERROR";
      throw error;
    }

    const raw = await response.text();
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!response.ok || !payload?.ok) {
      const error = new Error(
        payload?.message ||
          "AI NOTE 서버가 JSON 응답을 주지 못했습니다. HTTP " +
            response.status,
      );
      error.code =
        payload?.code || "AI_NOTE_HTTP_" + String(response.status || 0);
      error.detail = payload?.detail || raw.slice(0, 180);
      throw error;
    }

    return { ...payload, evidencePacket };
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function previewText(body) {
    const flat = String(body || "").replace(/\s+/g, " ").trim();
    if (!flat) return "";
    const firstSentence = flat.match(/^.{1,92}?[.!?](?:\s|$)/)?.[0]?.trim() || "";
    const base = firstSentence || flat;
    return base.length > 74 ? base.slice(0, 74).trimEnd() + "…" : base;
  }

  function renderAiNotes(panel, result) {
    const resultBox = panel.querySelector("[data-ai-note-result]");
    resultBox.replaceChildren();

    const usage = result.usageBreakdown || null;
    const metaLines = ["모델 " + (result.model || "-")];
    if (usage) {
      const tokenParts = [
        "입력 " + Number(usage.inputTokens || 0).toLocaleString(),
        "출력 " + Number(usage.outputTokens || 0).toLocaleString(),
        "추론 " + Number(usage.reasoningTokens || 0).toLocaleString(),
        "실제 답변 " + Number(usage.visibleOutputTokens || 0).toLocaleString(),
        "총 " + Number(usage.totalTokens || 0).toLocaleString() + " tokens",
      ];
      if (Number(usage.cachedInputTokens || 0) > 0) {
        tokenParts.splice(
          1,
          0,
          "캐시 입력 " + Number(usage.cachedInputTokens || 0).toLocaleString(),
        );
      }
      metaLines.push(tokenParts.join(" · "));
      if (usage.estimatedKrw != null) {
        metaLines.push(
          "이번 호출 예상 약 " +
            Number(usage.estimatedKrw).toLocaleString() +
            "원" +
            (usage.estimatedUsd != null
              ? " ($" + Number(usage.estimatedUsd).toFixed(4) + ")"
              : "") +
            " · 환율 " +
            Number(usage.usdKrwRate || 1400).toLocaleString() +
            "원 가정",
        );
      }
    } else if (result.usage?.total_tokens) {
      metaLines.push(
        "총 " + result.usage.total_tokens.toLocaleString() + " tokens",
      );
    }

    const meta = element(
      "div",
      "text-[10px] text-slate-400 font-medium leading-5 mb-3 whitespace-pre-line",
      metaLines.join("\n"),
    );
    resultBox.appendChild(meta);

    const roleLabels = {
      foundation: "01 · 사주 원본",
      mechanism: "02 · 원인 구조",
      fit: "03 · 잘 맞는 조건",
      caution: "04 · 거를 신호",
      timing: "05 · 가까운 시기",
    };

    const list = element(
      "div",
      "overflow-hidden rounded-2xl border border-violet-100 bg-white",
      "",
    );
    resultBox.appendChild(list);

    const closeOtherItems = (except) => {
      for (const item of list.querySelectorAll("[data-ai-accordion-item]")) {
        if (item === except) continue;
        item.dataset.open = "0";
        item.querySelector("[data-ai-accordion-body]")?.classList.add("hidden");
        item.querySelector("[data-ai-accordion-preview]")?.classList.remove("hidden");
        const icon = item.querySelector("[data-ai-accordion-icon]");
        if (icon) icon.style.transform = "rotate(0deg)";
        item.classList.remove("bg-violet-50/40");
      }
    };

    (result.notes || []).forEach((note, index) => {
      const item = element(
        "section",
        "border-b border-slate-100 last:border-b-0 transition-colors",
        "",
      );
      item.setAttribute("data-ai-accordion-item", "");
      item.dataset.open = index === 0 ? "1" : "0";

      const button = element(
        "button",
        "w-full text-left px-4 py-3.5 bg-transparent border-0 cursor-pointer flex items-start gap-3",
        "",
      );
      button.type = "button";
      button.setAttribute("aria-expanded", index === 0 ? "true" : "false");

      const textWrap = element("div", "min-w-0 flex-1", "");
      textWrap.appendChild(
        element(
          "div",
          "text-[9px] font-black tracking-wide text-violet-500 mb-1",
          roleLabels[note.role] || note.role,
        ),
      );
      textWrap.appendChild(
        element(
          "h4",
          "text-[13.5px] font-black text-slate-900 leading-[1.45] break-keep",
          note.title,
        ),
      );

      const preview = element(
        "p",
        "mt-1.5 text-[10.5px] leading-[1.6] text-slate-400 break-keep",
        previewText(note.basis || note.body),
      );
      preview.setAttribute("data-ai-accordion-preview", "");
      if (index === 0) preview.classList.add("hidden");
      textWrap.appendChild(preview);

      const icon = element(
        "span",
        "shrink-0 mt-5 text-[15px] leading-none text-slate-400 transition-transform duration-200",
        "⌄",
      );
      icon.setAttribute("data-ai-accordion-icon", "");
      if (index === 0) icon.style.transform = "rotate(180deg)";

      button.append(textWrap, icon);
      item.appendChild(button);

      const detail = element(
        "div",
        "px-4 pb-4 pt-0",
        "",
      );
      detail.setAttribute("data-ai-accordion-body", "");
      if (index !== 0) detail.classList.add("hidden");

      const basis = element(
        "div",
        "pt-1 pb-3 text-[12.5px] leading-7 font-bold text-slate-800 whitespace-pre-line break-keep",
        note.basis || "",
      );
      detail.appendChild(basis);

      const body = element(
        "div",
        "text-[12.5px] leading-7 text-slate-700 whitespace-pre-line break-keep",
        note.body,
      );
      detail.appendChild(body);

      const evidence = element(
        "div",
        "mt-3 pt-3 border-t border-slate-100 text-[9px] leading-4 text-slate-400",
        "근거 " + (note.evidenceIds || []).join(" · "),
      );
      detail.appendChild(evidence);
      item.appendChild(detail);

      if (index === 0) item.classList.add("bg-violet-50/40");

      button.addEventListener("click", () => {
        const willOpen = item.dataset.open !== "1";
        if (willOpen) closeOtherItems(item);
        item.dataset.open = willOpen ? "1" : "0";
        button.setAttribute("aria-expanded", willOpen ? "true" : "false");
        detail.classList.toggle("hidden", !willOpen);
        preview.classList.toggle("hidden", willOpen);
        icon.style.transform = willOpen ? "rotate(180deg)" : "rotate(0deg)";
        item.classList.toggle("bg-violet-50/40", willOpen);
      });

      list.appendChild(item);
    });
  }

  function getProductionNotes(data, mode) {
    const cached = data?.__aiNoteV4;
    if (!cached || !Array.isArray(cached.notes)) return null;
    const key = runtimeKey(data, mode);
    return cached.key === key ? cached.notes : null;
  }

  async function ensureProductionNotes(data, mode) {
    if (!data || typeof data !== "object") return null;
    const normalizedMode = mode === "T" ? "T" : "F";
    const existing = getProductionNotes(data, normalizedMode);
    if (existing?.length) return existing;

    const state = productionState(data);
    if (state && !canAttemptProductionNotes(data)) {
      const error = new Error(state.lastError || "AI_NOTE_RETRY_LIMIT");
      error.code = state.lastError || "AI_NOTE_RETRY_LIMIT";
      throw error;
    }

    if (state) {
      state.attempts += 1;
      state.lastAttemptAt = Date.now();
      state.lastError = "";
    }

    let packet;
    try {
      packet = buildEvidencePacket(data, normalizedMode);
    } catch (error) {
      if (state) {
        state.success = false;
        state.lastError = String(error?.code || error?.message || "EVIDENCE_PACKET_BUILD_FAILED");
      }
      throw error;
    }

    const key = [
      VERSION,
      packet.structureFingerprint || "",
      packet.timingFingerprint || "",
      packet.question?.concern || "",
      packet.question?.situationKey || "",
      normalizedMode,
    ].join("|");

    if (productionInflight.has(key)) return productionInflight.get(key);

    const promise = generateAiNotes(data, normalizedMode)
      .then((result) => {
        const notes = mapAiNotesToProduction(result, data, normalizedMode);
        if (notes.length !== 5) throw new Error("AI_NOTE_COUNT_MISMATCH");
        data.__aiNoteV4 = {
          key,
          version: VERSION,
          mode: normalizedMode,
          generatedAt: new Date().toISOString(),
          model: result?.model || "",
          attempts: Number(result?.attempts || 1),
          notes,
          termContext: buildTermContext(result?.evidencePacket || packet),
        };
        if (state) {
          state.success = true;
          state.lastError = "";
        }
        return notes;
      })
      .catch((error) => {
        if (state) {
          state.success = false;
          state.lastError = String(error?.code || error?.message || "AI_NOTE_FAILED");
        }
        throw error;
      })
      .finally(() => productionInflight.delete(key));

    productionInflight.set(key, promise);
    return promise;
  }

  function describeTerm(data, term) {
    return String(data?.__aiNoteV4?.termContext?.[term] || "");
  }

  function mountTestPanel(data, mode) {
    if (!testEnabled()) return;

    const notesContainer = document.getElementById("notesListContainer");
    if (!notesContainer) return;

    document.getElementById(TEST_PANEL_ID)?.remove();

    const panel = element(
      "section",
      "mt-6 rounded-3xl border border-violet-200 bg-violet-50/40 p-4",
    );
    panel.id = TEST_PANEL_ID;

    panel.appendChild(
      element(
        "div",
        "text-[10px] font-black tracking-[0.12em] text-violet-500 mb-1",
        "AI NOTE TEST",
      ),
    );
    panel.appendChild(
      element(
        "h3",
        "text-sm font-black text-slate-900 mb-1",
        "오행·십신·격국을 근거 그대로 풀어쓴 새 5개 답변",
      ),
    );
    panel.appendChild(
      element(
        "p",
        "text-[11px] leading-5 text-slate-500 mb-4",
        "오행 개수, 실제 세력, 십신, 신강·신약, 격국과 합충까지 숨기지 않고 먼저 보여준 뒤 지금 고민에 연결해.",
      ),
    );

    const button = element(
      "button",
      "w-full rounded-2xl bg-violet-600 px-4 py-3 text-xs font-black text-white border-0 cursor-pointer",
      "AI 5개 NOTE 생성하기",
    );
    button.type = "button";
    panel.appendChild(button);

    const status = element(
      "div",
      "hidden mt-3 text-[11px] leading-5 text-slate-500",
      "",
    );
    status.setAttribute("data-ai-note-status", "");
    panel.appendChild(status);

    const resultBox = element("div", "mt-4 space-y-3", "");
    resultBox.setAttribute("data-ai-note-result", "");
    panel.appendChild(resultBox);

    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "GPT가 명리 근거를 종합하는 중...";
      status.classList.remove("hidden");
      status.textContent =
        "생년월일·이름은 보내지 않고, 어떤언니 엔진이 계산한 명리 근거와 현재 고민만 전송하고 있어.";

      try {
        const result = await generateAiNotes(data, mode);
        status.textContent =
          "완료. 위 기존 NOTE와 아래 근거 우선 5개 NOTE를 내용만 보고 비교해봐.";
        renderAiNotes(panel, result);
      } catch (error) {
        status.textContent =
          "생성 실패: " +
          (error?.message || "알 수 없는 오류") +
          (error?.code ? " (" + error.code + ")" : "") +
          (error?.detail ? "\n" + error.detail : "");
      } finally {
        button.disabled = false;
        button.textContent = "AI 5개 NOTE 다시 생성하기";
      }
    });

    notesContainer.insertAdjacentElement("afterend", panel);
  }

  const originalGenerate = global.generateConcernNotes;
  if (typeof originalGenerate === "function") {
    const wrappedGenerate = function (data, mode) {
      const normalizedMode = mode === "T" ? "T" : "F";
      // 결과 화면 NOTE는 항상 명리 엔진 문장이다. AI NOTE는 테스트 패널에서만 따로 비교한다.
      const notes = originalGenerate(data, normalizedMode);
      if (testEnabled()) {
        setTimeout(() => mountTestPanel(data || {}, normalizedMode), 0);
      }
      return notes;
    };
    wrappedGenerate.__aiNoteTestWrapped = true;
    wrappedGenerate.__base = originalGenerate;
    wrappedGenerate.__classicalCausal = originalGenerate.__classicalCausal === true;
    wrappedGenerate.__noteV2Wrapped = originalGenerate.__noteV2Wrapped === true;
    wrappedGenerate.__legacyBase = originalGenerate.__legacyBase;
    global.generateConcernNotes = wrappedGenerate;
  }

  const runtime = {
    version: VERSION,
    enabled: testEnabled,
    autoProductionEnabled,
    buildEvidencePacket,
    generateAiNotes,
    mapAiNotesToProduction,
    getProductionNotes,
    ensureProductionNotes,
    productionAiEnabled,
    canAttemptProductionNotes,
    productionNoteStatus,
    describeTerm,
    mountTestPanel,
  };
  global.__UNNI_AI_NOTE_V4__ = runtime;
  global.__UNNI_AI_NOTE_TEST_V1__ = runtime;
})(globalThis);
