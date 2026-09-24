(function (global) {
  "use strict";

  const VERSION = "1.3.2";
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
        situationObject: diagnosis.situation?.object || "",
        instruction:
          "이 선택값은 답변 범위와 현실 번역의 초점만 정하며 명리 근거의 우선순위를 미리 정하지 않는다.",
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

  async function checkAiEndpoint() {
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidencePacket }),
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
      conclusion: "01 · 결론",
      cause: "02 · 반복 원인",
      contrast: "03 · 나만의 반전",
      conditions: "04 · 잘됨 / 소모 조건",
      timing: "05 · 가까운 시기",
      decision: "06 · 판단 기준",
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
        "사주에서 잡힌 차이부터 설명하는 새 6개 답변",
      ),
    );
    panel.appendChild(
      element(
        "p",
        "text-[11px] leading-5 text-slate-500 mb-4",
        "먼저 이 사주에서 실제로 강한 것·약한 것·엇갈리는 지점을 보여주고, 그다음 지금 고민에서 무슨 뜻인지 풀어.",
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
          "생성 실패: " +
          (error?.message || "알 수 없는 오류") +
          (error?.code ? " (" + error.code + ")" : "") +
          (error?.detail ? "\n" + error.detail : "");
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
