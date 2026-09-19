const { chromium } = require('playwright');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function plain(v) {
  return String(v || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '2.0.0' &&
    typeof buildIntegratedSajuProfile === 'function' &&
    typeof buildConcernDiagnosisV2 === 'function' &&
    typeof generateConcernNotes === 'function'
  );

  const result = await page.evaluate(() => {
    const localNorm = (v) => String(v || '').replace(/<[^>]+>/g,' ').replace(/[\\s.,!?·‘’'"“”()\\[\\]]/g,'');
    const exact = calculateAccurateManse(1998,2,21,'03:10','female');
    const other = calculateAccurateManse(1990,1,2,'12:00','female');
    const concerns = ['money','career','love','path','people','mental'];
    const profiles = globalThis.__PAID_VALUE_LAYER_V1__?.situationProfiles || {};

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
      for (const situation of Object.keys(profiles[concern] || {})) {
        const dataF = prep(exact, concern, situation, 'F');
        const dataT = prep(exact, concern, situation, 'T');
        const diagF = buildConcernDiagnosisV2(dataF);
        const diagT = buildConcernDiagnosisV2(dataT);
        const notesF = generateConcernNotes(dataF,'F');
        const notesT = generateConcernNotes(dataT,'T');
        rows.push({
          concern,
          situation,
          diagF:{
            fingerprint:diagF.fingerprint,
            primary:diagF.primary,
            secondary:diagF.secondary,
          },
          diagT:{
            fingerprint:diagT.fingerprint,
            primary:diagT.primary,
            secondary:diagT.secondary,
          },
          notesF,
          notesT,
          auditF:dataF.noteV2Audit,
          auditT:dataT.noteV2Audit,
        });
      }
    }

    const sameSituationA = prep(exact,'love','relationship','F');
    const sameSituationB = prep(other,'love','relationship','F','19900102','12:00');
    const diagA = buildConcernDiagnosisV2(sameSituationA);
    const diagB = buildConcernDiagnosisV2(sameSituationB);
    const notesA = generateConcernNotes(sameSituationA,'F');
    const notesB = generateConcernNotes(sameSituationB,'F');

    return {
      engine:globalThis.__CONCERN_NOTE_ENGINE_V2__,
      integrated:globalThis.__INTEGRATED_SAJU_PROFILE_V1__,
      wrapper:!!generateConcernNotes.__noteV2Wrapped,
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
      differentChart:{
        diagA,diagB,
        noteDiffs:notesA.map((n,i)=>localNorm(n.desc)!==localNorm(notesB[i].desc)),
      },
    };
  });

  assert(result.engine?.version === '2.0.0', 'NOTE v2 engine missing');
  assert(result.integrated?.version === '1.0.0', 'integrated profile missing');
  assert(result.wrapper, 'NOTE v2 wrapper missing');
  assert(result.exactPillars.join(',') === '戊寅,甲寅,己亥,乙丑', 'canonical pillars drift: '+result.exactPillars.join(','));
  assert(JSON.stringify(result.exactRaw) === JSON.stringify({mok:4,hwa:0,to:3,geum:0,su:1}), 'canonical raw elements drift: '+JSON.stringify(result.exactRaw));
  assert(result.exactProfile.audit.missing.length === 0, 'semantic layer coverage missing: '+result.exactProfile.audit.missing.join(','));
  assert(result.exactProfile.fingerprint !== result.otherProfile.fingerprint, 'different charts share integrated fingerprint');

  assert(result.rows.length === 24, 'expected 24 situation rows, got '+result.rows.length);
  const jargon=/(신강|신약|중화|격국|용신|상신|기신|지장간|월령|조후|통관|사령)/;

  for (const row of result.rows) {
    assert(row.diagF.fingerprint === row.diagT.fingerprint, row.concern+'/'+row.situation+': F/T diagnosis facts diverged');
    assert(row.diagF.primary.cluster === row.diagT.primary.cluster && row.diagF.secondary.cluster === row.diagT.secondary.cluster,
      row.concern+'/'+row.situation+': F/T core diagnosis diverged');

    for (const [mode, notes, audit] of [['F',row.notesF,row.auditF],['T',row.notesT,row.auditT]]) {
      assert(notes.length === 6, row.concern+'/'+row.situation+'/'+mode+': expected six notes');
      assert(audit?.version === '2.0.0' && audit?.fingerprint, row.concern+'/'+row.situation+'/'+mode+': NOTE v2 audit missing');
      assert(audit.primary?.cluster && audit.secondary?.cluster, row.concern+'/'+row.situation+'/'+mode+': diagnosis cluster missing');
      const all=notes.map(n=>plain((n.title||'')+' '+(n.desc||'')+' '+(n.checklist||''))).join(' ');
      assert(!jargon.test(all), row.concern+'/'+row.situation+'/'+mode+': hard saju jargon leaked');
      assert(!/(undefined|NaN|null)/.test(all), row.concern+'/'+row.situation+'/'+mode+': bad token leaked');
      assert(plain(notes[0].desc).length >= 90 && plain(notes[0].desc).length <= 560, row.concern+'/'+row.situation+'/'+mode+': NOTE1 should be concise and specific');
      assert(plain(notes[1].desc).length >= 100 && plain(notes[1].desc).length <= 620, row.concern+'/'+row.situation+'/'+mode+': NOTE2 should be concise and specific');
      assert(notes[5]?.__timingQA?.concernSituation === row.situation, row.concern+'/'+row.situation+'/'+mode+': NOTE6 situation metadata missing');
      assert(norm(notes[5]?.__timingQA?.firstBody) !== norm(notes[5]?.__timingQA?.secondBody), row.concern+'/'+row.situation+'/'+mode+': timing roles duplicated');
      const high=[audit.primary,audit.secondary].filter(x=>x.confidence==='high');
      for(const h of high) {
        assert(new Set((h.evidence||[]).map(x=>x.source)).size >= 2, row.concern+'/'+row.situation+'/'+mode+': high-confidence statement lacks two independent signals');
      }
    }

    assert(norm(row.notesF[0].desc) !== norm(row.notesT[0].desc), row.concern+'/'+row.situation+': F/T renderer voice did not differ');
    assert(row.notesF[0].title !== row.notesT[0].title, row.concern+'/'+row.situation+': F/T title voice did not differ');
  }

  for (const concern of ['money','career','love','path','people','mental']) {
    const rows=result.rows.filter(r=>r.concern===concern);
    assert(rows.length===4, concern+': expected four situations');
    const sig=new Set(rows.map(r=>norm(r.notesF[0].title+' '+r.notesF[1].desc+' '+r.notesF[3].desc)));
    assert(sig.size===4, concern+': four situation paths are not distinct');
  }

  assert(result.differentChart.diagA.fingerprint !== result.differentChart.diagB.fingerprint, 'different charts share NOTE diagnosis fingerprint');
  assert(result.differentChart.diagA.primary.cluster !== result.differentChart.diagB.primary.cluster ||
         result.differentChart.diagA.secondary.cluster !== result.differentChart.diagB.secondary.cluster ||
         result.differentChart.diagA.primary.confidence !== result.differentChart.diagB.primary.confidence,
         'different charts produced indistinguishable core diagnosis');
  assert(result.differentChart.noteDiffs.filter(Boolean).length >= 4, 'different charts do not materially change enough NOTE outputs');

  assert(errors.length === 0, 'browser errors: '+errors.join(' | '));
  console.log('CONCERN_NOTE_V2_PASS', JSON.stringify({
    version:result.engine.version,
    rows:result.rows.length,
    differentChartNotes:result.differentChart.noteDiffs.filter(Boolean).length,
  }));
  await browser.close();
})().catch(err=>{ console.error(err.stack||err); process.exit(1); });
