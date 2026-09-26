const { chromium } = require('playwright');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
function plain(v) {
  return String(v || '').replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
function norm(v) {
  return plain(v).replace(/[\s.,!?·‘’'"“”()\[\]]/g, '');
}

(async () => {
  const browser = await chromium.launch({ headless:true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('[pageerror] ' + (e.stack || e.message)));
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });

  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil:'load' });
  await page.waitForFunction(() =>
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '6.7.0' &&
    globalThis.__INTEGRATED_SAJU_PROFILE_V1__?.version === '2.1.0' &&
    globalThis.__CLASSICAL_REASONING_V1__?.version === '2.1.1' &&
    typeof buildIntegratedSajuProfile === 'function' &&
    typeof buildConcernDiagnosisV2 === 'function' &&
    typeof buildClassicalReasoningV1 === 'function' &&
    typeof generateConcernNotes === 'function'
  );

  const result = await page.evaluate(() => {
    const localNorm = (v) => String(v || '').replace(/<[^>]+>/g,' ').replace(/[\s.,!?·‘’'"“”()\[\]]/g,'');
    const exact = calculateAccurateManse(1998,2,21,'03:10','female');
    const other = calculateAccurateManse(1990,1,2,'12:00','female');
    const situations = globalThis.__CONCERN_NOTE_ENGINE_V2__?.situations || {};
    const concerns = Object.keys(situations);

    function prep(r, concern, situation, mode='F', birth='19980221', time='03:10') {
      return {
        ...r,
        name:'테스트',
        concernKey:concern,
        concernSituation:situation,
        userBirthStr:birth,
        userTimeKey:time,
        userGender:'female',
        userCalendar:'solar',
        currentMode:mode,
        rawSolutionTemplate:{F:{acts:[{d:'a'},{d:'b'}]},T:{acts:[{d:'a'},{d:'b'}]}},
      };
    }

    const exactProfile = buildIntegratedSajuProfile(prep(exact,'love','relationship'));
    const otherProfile = buildIntegratedSajuProfile(prep(other,'love','relationship','F','19900102','12:00'));

    const rows = [];
    for (const concern of concerns) {
      for (const situation of Object.keys(situations[concern] || {})) {
        const dataF = prep(exact,concern,situation,'F');
        const dataT = prep(exact,concern,situation,'T');
        const diagF = buildConcernDiagnosisV2(dataF);
        const diagT = buildConcernDiagnosisV2(dataT);
        const notesF = generateConcernNotes(dataF,'F');
        const notesT = generateConcernNotes(dataT,'T');
        rows.push({
          concern,situation,
          diagF:{structureFingerprint:diagF.structureFingerprint,timingFingerprint:diagF.timingFingerprint},
          diagT:{structureFingerprint:diagT.structureFingerprint,timingFingerprint:diagT.timingFingerprint},
          notesF,notesT,
          auditF:dataF.noteV3Audit,
          auditT:dataT.noteV3Audit,
        });
      }
    }

    const notesA = generateConcernNotes(prep(exact,'love','relationship','F'),'F');
    const notesB = generateConcernNotes(prep(other,'love','relationship','F','19900102','12:00'),'F');
    const repeatA = generateConcernNotes(prep(exact,'love','relationship','F'),'F');
    const repeatB = generateConcernNotes(prep(exact,'love','relationship','F'),'F');

    // 반사실 검사: 같은 사주에서 십신 그룹 세력만 강제로 바꾸면 대표 판단도 같이 바뀌어야 한다.
    const cfData=prep(exact,'money','saving','F');
    const cfDiag=buildConcernDiagnosisV2(cfData);
    const cfRows=cfDiag.reasoning?.synthesis?.tenGodEvidence||[];
    const cfGroups=[...new Set(cfRows.map(x=>x.group).filter(Boolean))].slice(0,2);
    const forceGroup=(target)=>{
      const cloned=JSON.parse(JSON.stringify(cfDiag.reasoning));
      cloned.synthesis.tenGodEvidence=(cloned.synthesis.tenGodEvidence||[]).map(row=>({
        ...row,
        weight:row.group===target?100:1,
        visibleWeight:row.group===target?100:1,
        hiddenWeight:0,
      }));
      return cloned;
    };
    const cfA=forceGroup(cfGroups[0]);
    const cfB=forceGroup(cfGroups[1]);

    // 처방처럼 NOTE4를 직접 결정하는 엔진 입력은 바뀌면 실제 NOTE4 문장도 바뀌어야 한다.
    const forcePrescription=(element)=>{
      const cloned=JSON.parse(JSON.stringify(cfDiag.reasoning));
      cloned.synthesis=cloned.synthesis||{};
      cloned.synthesis.mechanisms=cloned.synthesis.mechanisms||{};
      cloned.synthesis.mechanisms.adjustment=cloned.synthesis.mechanisms.adjustment||{};
      cloned.synthesis.mechanisms.adjustment.prescription={
        ...(cloned.synthesis.mechanisms.adjustment.prescription||{}),
        sequence:[{element}],
        overlapElements:[element],
      };
      return cloned;
    };
    const prA=forcePrescription('hwa');
    const prB=forcePrescription('su');
    const planPrA=globalThis.__CONCERN_NOTE_ENGINE_V2__._testGrounding(prA,cfDiag.situation,cfData);
    const planPrB=globalThis.__CONCERN_NOTE_ENGINE_V2__._testGrounding(prB,cfDiag.situation,cfData);
    const note4A=globalThis.__CONCERN_NOTE_ENGINE_V2__._testNoteFix(prA,cfDiag.situation,cfData,'F');
    const note4B=globalThis.__CONCERN_NOTE_ENGINE_V2__._testNoteFix(prB,cfDiag.situation,cfData,'F');

    return {
      engine:globalThis.__CONCERN_NOTE_ENGINE_V2__,
      integrated:globalThis.__INTEGRATED_SAJU_PROFILE_V1__,
      reasoning:globalThis.__CLASSICAL_REASONING_V1__,
      wrapper:!!generateConcernNotes.__noteV2Wrapped && !!generateConcernNotes.__classicalCausal,
      exactPillars:[
        exact.pillars.year.gan+exact.pillars.year.zhi,
        exact.pillars.month.gan+exact.pillars.month.zhi,
        exact.pillars.day.gan+exact.pillars.day.zhi,
        exact.pillars.hour.gan+exact.pillars.hour.zhi,
      ],
      exactRaw:exact.elementProfiles.raw,
      exactProfile,
      otherProfile,
      rows,
      differentChartDiffs:notesA.map((n,i)=>localNorm(n.desc)!==localNorm(notesB[i]?.desc)),
      deterministic:repeatA.every((n,i)=>
        localNorm((n.title||'')+' '+(n.desc||'')+' '+(n.checklist||'')) ===
        localNorm((repeatB[i]?.title||'')+' '+(repeatB[i]?.desc||'')+' '+(repeatB[i]?.checklist||''))
      ),
      counterfactual:{
        groups:cfGroups,
        topA:globalThis.__CONCERN_NOTE_ENGINE_V2__._testTopGroup(cfA),
        topB:globalThis.__CONCERN_NOTE_ENGINE_V2__._testTopGroup(cfB),
        prescriptionA:planPrA.needGroup,
        prescriptionB:planPrB.needGroup,
        note4A:localNorm(note4A),
        note4B:localNorm(note4B),
      },
    };
  });

  assert(result.engine?.version === '6.7.0', 'NOTE v3 engine missing');
  assert(result.integrated?.version === '2.1.0', 'integrated profile v2 missing');
  assert(result.reasoning?.version === '2.1.1', 'classical reasoning engine missing');
  assert(result.wrapper, 'full-evidence classical NOTE wrapper missing');
  assert(result.exactPillars.join(',') === '戊寅,甲寅,己亥,乙丑', 'canonical pillars drift: '+result.exactPillars.join(','));
  assert(JSON.stringify(result.exactRaw) === JSON.stringify({mok:4,hwa:0,to:3,geum:0,su:1}), 'canonical raw elements drift');
  assert(result.exactProfile.audit.missing.length === 0, 'profile coverage missing: '+result.exactProfile.audit.missing.join(','));
  assert(!('qiongtong' in result.exactProfile.classical), 'Qiongtong must not remain in integrated classical profile');
  assert(result.exactProfile.fingerprint !== result.otherProfile.fingerprint, 'different charts share integrated fingerprint');

  assert(result.rows.length === 24, 'expected 24 situation rows, got '+result.rows.length);
  const jargon=/(신강|신약|중화|격국|용신|상신|기신|지장간|월령|조후|통관|사령|원국|대운|세운|월운)/;

  for (const row of result.rows) {
    assert(row.diagF.structureFingerprint === row.diagT.structureFingerprint,
      row.concern+'/'+row.situation+': F/T changed natal reasoning');
    assert(row.diagF.timingFingerprint === row.diagT.timingFingerprint,
      row.concern+'/'+row.situation+': F/T changed timing reasoning');

    for (const [mode,notes,audit] of [['F',row.notesF,row.auditF],['T',row.notesT,row.auditT]]) {
      assert(notes.length === 6, row.concern+'/'+row.situation+'/'+mode+': expected six answers');
      assert(notes.map(n=>n.themeNum).join(',') === '01,02,03,04,05,06', row.concern+'/'+row.situation+'/'+mode+': six-answer numbering drift');
      assert(audit?.version === '6.7.0' && audit?.engine === 'classical-causal-full-evidence', row.concern+'/'+row.situation+'/'+mode+': causal audit missing');
      assert(audit.genericClusterDependency === false, row.concern+'/'+row.situation+'/'+mode+': generic cluster dependency returned');
      assert(audit.structureFingerprint && audit.timingFingerprint && audit.synthesisFingerprint, row.concern+'/'+row.situation+'/'+mode+': fingerprints missing');
      assert(audit.evidenceCoverage?.coverageRate === 1 && audit.evidenceCoverage?.missingRuleIds?.length === 0,
        row.concern+'/'+row.situation+'/'+mode+': supported classical evidence was dropped '+JSON.stringify(audit.evidenceCoverage));
      assert(Array.isArray(audit.noteEvidence) && audit.noteEvidence.length === 6,
        row.concern+'/'+row.situation+'/'+mode+': six-answer evidence plan missing');
      assert(Array.isArray(audit.priorityMechanisms) && audit.priorityMechanisms.length >= 4,
        row.concern+'/'+row.situation+'/'+mode+': priority mechanism synthesis too thin');
      assert(Array.isArray(audit.claims) && audit.claims.length === 6, row.concern+'/'+row.situation+'/'+mode+': six internal causal claims missing');
      assert(Array.isArray(audit.outputClaimMap) && audit.outputClaimMap.length === 6, row.concern+'/'+row.situation+'/'+mode+': claim-first NOTE plan missing');
      assert(
        audit.behaviorTemplateDependency === true &&
        audit.behaviorTemplateEvidenceDependency === false &&
        audit.behaviorTemplateRole === 'claim-bounded-domain-translation' &&
        Array.isArray(audit.behaviorTemplateFieldsUsed),
        row.concern+'/'+row.situation+'/'+mode+': domain translation templates are misreported as evidence-free copy'
      );
      assert(audit.interpretationPlan?.primaryGroup && audit.interpretationPlan?.groupShares,
        row.concern+'/'+row.situation+'/'+mode+': cross-validated interpretation plan missing');
      const strongSceneVisible=notes.some(n=>/가능성이 높아/.test(plain(n.desc)));
      if(strongSceneVisible){
        assert((audit.interpretationPlan.selected||[]).some(x =>
          x.confidence==='high' &&
          Number(x.independentEvidenceCount||0)>=3 &&
          Array.isArray(x.counterEvidenceIds) &&
          x.counterEvidenceIds.length===0
        ), row.concern+'/'+row.situation+'/'+mode+': strong lived-scene copy escaped without high-confidence support');
      }
      for (const item of audit.interpretationPlan.selected || []) {
        assert(item.independentEvidenceCount === new Set(item.evidenceAxes || []).size,
          row.concern+'/'+row.situation+'/'+mode+': independent evidence axes are double-counted '+JSON.stringify(item));
        assert(!(item.evidenceIds || []).some(id => String(id).startsWith('GROUP_EXTREME:')),
          row.concern+'/'+row.situation+'/'+mode+': one group share is counted twice as independent evidence '+JSON.stringify(item));
      }
      for (const claim of audit.claims) {
        assert(claim.id && claim.rawFacts && Array.isArray(claim.ditianRuleIds) && Array.isArray(claim.zipingRuleIds),
          row.concern+'/'+row.situation+'/'+mode+': claim provenance missing');
        assert(claim.ditianRuleIds.filter(Boolean).length > 0 && claim.zipingRuleIds.filter(Boolean).length > 0,
          row.concern+'/'+row.situation+'/'+mode+': claim rule ids missing');
        assert(claim.conclusion, row.concern+'/'+row.situation+'/'+mode+': claim conclusion missing');
      }
      for (const link of audit.outputClaimMap) {
        const note=notes[link.noteNum-1];
        assert(link.claimId && note?.__claim?.id===link.claimId && note?.__claim?.source===link.source,
          row.concern+'/'+row.situation+'/'+mode+': NOTE was rendered before its claim was selected');
        if(link.source==='concern-cross-validation'){
          assert(Array.isArray(note.__interpretationEvidenceIds) && note.__interpretationEvidenceIds.length>0,
            row.concern+'/'+row.situation+'/'+mode+': concern claim has no interpretation evidence');
        }
      }
      assert(audit.sourceLayers?.ditian === '1.1.0' && audit.sourceLayers?.ziping === '1.1.0',
        row.concern+'/'+row.situation+'/'+mode+': source layer versions missing');
      assert(audit.ruleLayers?.ditian === '1.2.0' && audit.ruleLayers?.ziping === '1.1.0',
        row.concern+'/'+row.situation+'/'+mode+': rule layer versions missing');
      const all=notes.map(n=>plain((n.title||'')+' '+(n.desc||'')+' '+(n.checklist||''))).join(' ');
      assert(!jargon.test(all), row.concern+'/'+row.situation+'/'+mode+': internal saju jargon leaked: '+all);
      assert(!all.includes('계산값 그대로'), row.concern+'/'+row.situation+'/'+mode+': raw calculation dump leaked');
      assert(!/(undefined|NaN|null)/.test(all), row.concern+'/'+row.situation+'/'+mode+': bad token leaked');
      for (const [i,note] of notes.entries()) {
        const len=plain(note.desc).length;
        assert(len >= 110 && len <= 1600, row.concern+'/'+row.situation+'/'+mode+': answer '+(i+1)+' length drift '+len);
        assert(plain(note.desc).includes('결론'), row.concern+'/'+row.situation+'/'+mode+': answer '+(i+1)+' does not lead with a conclusion');
      }
      assert(!/(비밀\s*메모|실전 룰|반복 패턴|압박|구조)/.test(all), row.concern+'/'+row.situation+'/'+mode+': old/abstract consultation wording leaked');
      assert(notes[5]?.__timingQA?.structureFingerprint === audit.structureFingerprint,
        row.concern+'/'+row.situation+'/'+mode+': timing answer lost natal fingerprint');
    }

    assert(norm(row.notesF[0].desc) !== norm(row.notesT[0].desc), row.concern+'/'+row.situation+': F/T tone did not differ');
    assert(row.auditF.structureFingerprint === row.auditT.structureFingerprint, row.concern+'/'+row.situation+': F/T changed facts');
  }

  for (const concern of Object.keys(result.engine.situations)) {
    const rows=result.rows.filter(r=>r.concern===concern);
    assert(rows.length===4, concern+': expected four situations');
    const sig=new Set(rows.map(r=>norm(r.notesF[0].title+' '+r.notesF[1].desc+' '+r.notesF[3].desc)));
    assert(sig.size===4, concern+': four situation applications are not distinct');
  }

  assert(result.differentChartDiffs.filter(Boolean).length >= 3, 'different charts should change a majority of the six answers without forcing fake differences: '+JSON.stringify(result.differentChartDiffs));
  assert(result.deterministic, 'same saju facts and situation must be deterministic');
  assert(result.counterfactual.groups.length===2 && result.counterfactual.topA===result.counterfactual.groups[0] && result.counterfactual.topB===result.counterfactual.groups[1],
    'aggregate group counterfactual did not change topGroup '+JSON.stringify(result.counterfactual));
  assert(
    result.counterfactual.prescriptionA!==result.counterfactual.prescriptionB &&
    result.counterfactual.note4A!==result.counterfactual.note4B,
    'changing the engine prescription did not change NOTE4 '+JSON.stringify(result.counterfactual)
  );
  assert(errors.length === 0, 'browser errors: '+errors.join(' | '));

  console.log('CLASSICAL_CAUSAL_NOTE_PASS', JSON.stringify({
    version:result.engine.version,
    rows:result.rows.length,
    differentChartNotes:result.differentChartDiffs.filter(Boolean).length,
  }));
  await browser.close();
})().catch(err=>{ console.error(err.stack||err); process.exit(1); });
