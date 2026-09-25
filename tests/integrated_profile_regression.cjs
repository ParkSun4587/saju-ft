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
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '6.1.0' &&
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
    };
  });

  assert(result.engine?.version === '6.1.0', 'NOTE v3 engine missing');
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
      assert(notes.length === 7, row.concern+'/'+row.situation+'/'+mode+': expected seven answers');
      assert(notes.map(n=>n.themeNum).join(',') === '01,02,03,04,05,06,07', row.concern+'/'+row.situation+'/'+mode+': seven-answer numbering drift');
      assert(audit?.version === '6.1.0' && audit?.engine === 'classical-causal-full-evidence', row.concern+'/'+row.situation+'/'+mode+': causal audit missing');
      assert(audit.genericClusterDependency === false, row.concern+'/'+row.situation+'/'+mode+': generic cluster dependency returned');
      assert(audit.structureFingerprint && audit.timingFingerprint && audit.synthesisFingerprint, row.concern+'/'+row.situation+'/'+mode+': fingerprints missing');
      assert(audit.evidenceCoverage?.coverageRate === 1 && audit.evidenceCoverage?.missingRuleIds?.length === 0,
        row.concern+'/'+row.situation+'/'+mode+': supported classical evidence was dropped '+JSON.stringify(audit.evidenceCoverage));
      assert(Array.isArray(audit.noteEvidence) && audit.noteEvidence.length === 7,
        row.concern+'/'+row.situation+'/'+mode+': seven-answer evidence plan missing');
      assert(Array.isArray(audit.priorityMechanisms) && audit.priorityMechanisms.length >= 4,
        row.concern+'/'+row.situation+'/'+mode+': priority mechanism synthesis too thin');
      assert(Array.isArray(audit.claims) && audit.claims.length === 6, row.concern+'/'+row.situation+'/'+mode+': six internal causal claims missing');
      assert(Array.isArray(audit.outputClaimMap) && audit.outputClaimMap.length === 6, row.concern+'/'+row.situation+'/'+mode+': claim map must bind NOTE1-6 to the six classical claims');
      for (const claim of audit.claims) {
        assert(claim.id && claim.rawFacts && Array.isArray(claim.ditianRuleIds) && Array.isArray(claim.zipingRuleIds),
          row.concern+'/'+row.situation+'/'+mode+': claim provenance missing');
        assert(claim.ditianRuleIds.filter(Boolean).length > 0 && claim.zipingRuleIds.filter(Boolean).length > 0,
          row.concern+'/'+row.situation+'/'+mode+': claim rule ids missing');
        assert(claim.conclusion, row.concern+'/'+row.situation+'/'+mode+': claim conclusion missing');
      }
      for (const link of audit.outputClaimMap) {
        const claim=audit.claims[link.claimNum-1];
        assert(claim?.userNoteIndex===link.noteNum && claim?.noteSentence===plain(notes[link.noteNum-1]?.desc),
          row.concern+'/'+row.situation+'/'+mode+': rendered answer is not bound to mapped classical claim');
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
        assert(len >= 110 && len <= 950, row.concern+'/'+row.situation+'/'+mode+': answer '+(i+1)+' length drift '+len);
        assert(plain(note.desc).includes('결론'), row.concern+'/'+row.situation+'/'+mode+': answer '+(i+1)+' does not lead with a conclusion');
      }
      assert(!/(비밀\s*메모|실전 룰|반복 패턴|압박|구조)/.test(all), row.concern+'/'+row.situation+'/'+mode+': old/abstract consultation wording leaked');
      assert(notes[4]?.__timingQA?.structureFingerprint === audit.structureFingerprint,
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

  assert(result.differentChartDiffs.filter(Boolean).length >= 3, 'different charts should change a majority of the five answers without forcing fake differences: '+JSON.stringify(result.differentChartDiffs));
  assert(result.deterministic, 'same saju facts and situation must be deterministic');
  assert(errors.length === 0, 'browser errors: '+errors.join(' | '));

  console.log('CLASSICAL_CAUSAL_NOTE_PASS', JSON.stringify({
    version:result.engine.version,
    rows:result.rows.length,
    differentChartNotes:result.differentChartDiffs.filter(Boolean).length,
  }));
  await browser.close();
})().catch(err=>{ console.error(err.stack||err); process.exit(1); });
