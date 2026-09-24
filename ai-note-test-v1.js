(function (global) {
  "use strict";

  const VERSION = "1.0.0";
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

    const allowedEvidenceIds = unique([
      ...signals.map((signal) => signal.id),
      ...ruleIdsFromClaims,
      ...timingEvidenceIds,
    ]);

    return {
      schemaVersion: VERSION,
      requestMode: mode === "T" ? "T" : "F",
      question: {
        concern: diagnosis.situation?.concern || "",
        situationKey: diagnosis.situation?.key || "",
        situationLabel: diagnosis.situation?.label || "",
        instruction:
          "이 선택값은 답변 범위를 정하는 질문 정보일 뿐이며 명리 근거의 우선순위를 미리 정하지 않는다.",
      },
      structureFingerprint: reasoning.structureFingerprint || "",
      timingFingerprint: reasoning.timingFingerprint || "",
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

  async function generateAiNotes(data, mode) {
    const evidencePacket = buildEvidencePacket(data, mode);
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidencePacket }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {}

    if (!response.ok || !payload?.ok) {
      const error = new Error(
        payload?.message || "AI NOTE 테스트 생성에 실패했습니다.",
      );
      error.code = payload?.code || "AI_NOTE_REQUEST_FAILED";
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

  function renderAiNotes(panel, result) {
    const resultBox = panel.querySelector("[data-ai-note-result]");
    resultBox.replaceChildren();

    const meta = element(
      "div",
      "text-[10px] text-slate-400 font-medium mb-3",
      "모델 " +
        (result.model || "-") +
        (result.usage?.total_tokens
          ? " · 총 " + result.usage.total_tokens.toLocaleString() + " tokens"
          : ""),
    );
    resultBox.appendChild(meta);

    const roleLabels = {
      conclusion: "01 · 결론",
      cause: "02 · 반복 원인",
      contrast: "03 · 나만의 반전",
      conditions: "04 · 잘됨 / 소모 조건",
      timing: "05 · 가까운 시기",
      decision: "06 · 판단 기준",
    };

    for (const note of result.notes || []) {
      const card = element(
        "section",
        "rounded-2xl border border-violet-100 bg-white p-4 shadow-sm",
      );
      card.appendChild(
        element(
          "div",
          "text-[10px] font-black tracking-wide text-violet-500 mb-1",
          roleLabels[note.role] || note.role,
        ),
      );
      card.appendChild(
        element(
          "h4",
          "text-sm font-black text-slate-900 leading-snug mb-3",
          note.title,
        ),
      );

      const body = element(
        "div",
        "text-[13px] leading-7 text-slate-700 whitespace-pre-line break-keep",
        note.body,
      );
      card.appendChild(body);

      const evidence = element(
        "div",
        "mt-3 pt-3 border-t border-slate-100 text-[9px] leading-4 text-slate-400",
        "근거 " + (note.evidenceIds || []).join(" · "),
      );
      card.appendChild(evidence);
      resultBox.appendChild(card);
    }
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
        "현재 엔진 근거만으로 새 6개 답변 비교",
      ),
    );
    panel.appendChild(
      element(
        "p",
        "text-[11px] leading-5 text-slate-500 mb-4",
        "기존 NOTE는 그대로 두고, 같은 명리 근거를 GPT가 다시 종합한 결과만 아래에 붙여서 비교해.",
      ),
    );

    const button = element(
      "button",
      "w-full rounded-2xl bg-violet-600 px-4 py-3 text-xs font-black text-white border-0 cursor-pointer",
      "AI 6개 NOTE 생성하기",
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
          "완료. 위 기존 NOTE와 아래 AI 6개 NOTE를 내용만 보고 비교해봐.";
        renderAiNotes(panel, result);
      } catch (error) {
        status.textContent =
          "생성 실패: " + (error?.message || "알 수 없는 오류");
      } finally {
        button.disabled = false;
        button.textContent = "AI 6개 NOTE 다시 생성하기";
      }
    });

    notesContainer.insertAdjacentElement("afterend", panel);
  }

  const originalGenerate = global.generateConcernNotes;
  if (typeof originalGenerate === "function") {
    const wrappedGenerate = function (data, mode) {
      const notes = originalGenerate(data, mode);
      if (testEnabled()) {
        setTimeout(() => mountTestPanel(data || {}, mode || "F"), 0);
      }
      return notes;
    };
    wrappedGenerate.__aiNoteTestWrapped = true;
    wrappedGenerate.__base = originalGenerate;
    global.generateConcernNotes = wrappedGenerate;
  }

  global.__UNNI_AI_NOTE_TEST_V1__ = {
    version: VERSION,
    enabled: testEnabled,
    buildEvidencePacket,
    generateAiNotes,
    mountTestPanel,
  };
})(globalThis);
