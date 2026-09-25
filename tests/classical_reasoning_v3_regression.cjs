const { chromium } = require('playwright');

function assert(cond,msg){ if(!cond) throw new Error(msg); }

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('console',m=>{ if(m.type()==='error') errors.push(m.text()); });
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'load'});
  await page.waitForFunction(() =>
    globalThis.__CLASSICAL_REASONING_V1__?.version==='2.1.1' &&
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version==='6.2.0' &&
    typeof buildClassicalReasoningV1==='function'
  );

  const r=await page.evaluate(()=>{
    const E=globalThis.__CLASSICAL_ENGINE_V2__;
    const H=E.hidden;
    const pos=['year','month','day','hour'];

    function sipsinData(pillars){
      const dayGan=pillars.day.gan;
      const all=[];
      const by={};
      for(const k of pos){
        const p=pillars[k];
        if(!p) continue;
        const ganGod=k==='day'?'일간':E.tenGod(dayGan,p.gan);
        const main=H[p.zhi]?.[0] || '';
        const zhiGod=main?E.tenGod(dayGan,main):'';
        by[k]={gan:ganGod,zhi:zhiGod};
        if(k!=='day'&&ganGod) all.push({pillar:k,position:'천간',value:ganGod});
        if(zhiGod) all.push({pillar:k,position:'지지',value:zhiGod});
      }
      const count={};
      for(const row of all) count[row.value]=(count[row.value]||0)+1;
      return {all,count,by,dominant:Object.entries(count).sort((a,b)=>b[1]-a[1])[0]?.[0]||''};
    }

    function mk(pillars, opts={}){
      const ep=getElementProfilesV2(pillars);
      const st=analyzeDayMasterStrengthV2({pillars});
      const gg=determineGyeokgukFromPillarsV2(pillars,{});
      const ss=sipsinData(pillars);
      const gs=evaluateGyeokStatusV2(gg,ss.by);
      const ys=selectYongshinV2({pillars,strength:st,elementProfiles:ep,gyeokguk:gg});
      const classical=buildClassicalLayersV2({pillars,strength:st,elementProfiles:ep,gyeokguk:gg,yongshinDetail:ys,calendarMeta:{}});
      const realYeonun=opts.realYeonun || {
        y2026:{year:2026,daeunGanZhi:'癸亥',seyunGanZhi:'丙午',seyunGanSipsin:E.tenGod(pillars.day.gan,'丙'),wolun:[
          {ganZhi:'丁酉',sipsin:E.tenGod(pillars.day.gan,'丁'),startYmd:'2026-09-20',startMonth:9,startDay:20},
          {ganZhi:'戊戌',sipsin:E.tenGod(pillars.day.gan,'戊'),startYmd:'2026-10-08',startMonth:10,startDay:8},
        ]},
        y2027:{year:2027,daeunGanZhi:'癸亥',seyunGanZhi:'丁未',seyunGanSipsin:E.tenGod(pillars.day.gan,'丁'),wolun:[
          {ganZhi:'甲寅',sipsin:E.tenGod(pillars.day.gan,'甲'),startYmd:'2027-02-04',startMonth:2,startDay:4},
          {ganZhi:'乙卯',sipsin:E.tenGod(pillars.day.gan,'乙'),startYmd:'2027-03-06',startMonth:3,startDay:6},
        ]},
      };
      return {
        pillars,
        dayOheng:({甲:'mok',乙:'mok',丙:'hwa',丁:'hwa',戊:'to',己:'to',庚:'geum',辛:'geum',壬:'su',癸:'su'})[pillars.day.gan],
        strengthDetail:st,elementProfiles:ep,gyeokguk:gg,gyeokStatus:gs,yongshinDetail:ys,yongshin:ys.primary,
        analysisProfile:{
          dayMaster:{gan:pillars.day.gan,strength:st.verdict,supportRatio:st.supportRatio},
          strengthDetail:st,elementProfiles:ep,yongshinDetail:ys,
          structure:{
            gyeokName:gg.name,gyeokSipsin:gg.sipsin,basisGan:gg.basisGan,basis:gg.basis,status:gs.status,flow:gs.flow,
            sangsin:gs.sangsinFound,gisin:gs.gisinFound,touchul:!!gg.touchul,branchType:gg.branchType,saryeongGan:gg.saryeongGan,
            hiddenGans:gg.hiddenGans||[],visibleHidden:gg.visibleHidden||[],candidates:gg.candidates||[],confidence:gg.confidence||'',
          },
          sipsin:{all:ss.all,count:ss.count,dominant:ss.dominant},
          relations:{hasChung:false},
          stats:{},
          classical,
          timing:{yeonun:realYeonun},
        },
        elements:ep.raw,
        realYeonun,
        concernKey:opts.concernKey||'career',
        concernSituation:opts.concernSituation||'current',
        userGender:'female',
        __testNowYmd:'2026-09-19',
      };
    }

    function note(data,concern='career',situation='current'){
      const d={...data,concernKey:concern,concernSituation:situation};
      const notes=generateConcernNotes(d,'F');
      return {reasoning:d.classicalReasoningV1,audit:d.noteV3Audit,notes};
    }

    // A. Same day master, different month command.
    const a1=mk({year:{gan:'丙',zhi:'子'},month:{gan:'丙',zhi:'寅'},day:{gan:'甲',zhi:'辰'},hour:{gan:'戊',zhi:'午'}});
    const a2=mk({year:{gan:'丙',zhi:'子'},month:{gan:'辛',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'戊',zhi:'午'}});
    const A1=note(a1), A2=note(a2);

    // B. Same day master/month, roots present vs absent.
    const bRoot=mk({year:{gan:'丙',zhi:'子'},month:{gan:'辛',zhi:'酉'},day:{gan:'甲',zhi:'寅'},hour:{gan:'戊',zhi:'亥'}});
    const bNone=mk({year:{gan:'丙',zhi:'午'},month:{gan:'辛',zhi:'酉'},day:{gan:'甲',zhi:'戌'},hour:{gan:'戊',zhi:'申'}});
    const B1=note(bRoot), B2=note(bNone);

    // C. Same visible five-element counts, different month/hidden force.
    const c1=mk({year:{gan:'甲',zhi:'子'},month:{gan:'丙',zhi:'寅'},day:{gan:'戊',zhi:'辰'},hour:{gan:'庚',zhi:'申'}});
    const c2=mk({year:{gan:'甲',zhi:'寅'},month:{gan:'丙',zhi:'子'},day:{gan:'戊',zhi:'辰'},hour:{gan:'庚',zhi:'申'}});
    const C1=note(c1), C2=note(c2);

    // D. Same natal chart, different Daewoon only.
    const baseP={year:{gan:'戊',zhi:'午'},month:{gan:'辛',zhi:'酉'},day:{gan:'甲',zhi:'子'},hour:{gan:'己',zhi:'未'}};
    const dBase=mk(baseP);
    const realA=JSON.parse(JSON.stringify(dBase.realYeonun));
    const realB=JSON.parse(JSON.stringify(dBase.realYeonun));
    realA.y2026.daeunGanZhi='癸亥'; realA.y2027.daeunGanZhi='癸亥';
    realB.y2026.daeunGanZhi='庚申'; realB.y2027.daeunGanZhi='庚申';
    const D1=note(mk(baseP,{realYeonun:realA}));
    const D2=note(mk(baseP,{realYeonun:realB}));

    // E. Same saju, concern only changes.
    const eData=mk(baseP);
    const E1=note(eData,'money','saving');
    const E2=note(mk(baseP),'love','relationship');

    // F. Construct a body/structure conflict: weak 甲 with 正官 month and 財 exposed.
    const fData=mk(baseP);
    const F=note(fData,'career','current');

    // G. Extreme rootless case should be flagged, never invented as confirmed special structure.
    const gData=mk({year:{gan:'庚',zhi:'申'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'午'},hour:{gan:'丙',zhi:'午'}});
    const G=note(gData,'career','current');

    // Runtime kind integrity: force an actual 통관 candidate so bridge kind must exist too.
    const bridgeData=mk({
      year:{gan:'甲',zhi:'辰'},
      month:{gan:'戊',zhi:'辰'},
      day:{gan:'甲',zhi:'寅'},
      hour:{gan:'戊',zhi:'戌'},
    });
    const BRIDGE=note(bridgeData,'career','current');

    const plain=v=>String(v||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();

    return {
      A:{
        sameDay:a1.pillars.day.gan===a2.pillars.day.gan,
        month1:a1.pillars.month.zhi,month2:a2.pillars.month.zhi,
        fp1:A1.audit.structureFingerprint,fp2:A2.audit.structureFingerprint,
        note1:plain(A1.notes[0].desc),note2:plain(A2.notes[0].desc),
      },
      B:{
        root1:B1.reasoning.ditian.findings.find(x=>x.kind==='root')?.facts,
        root2:B2.reasoning.ditian.findings.find(x=>x.kind==='root')?.facts,
        note1:plain(B1.notes[0].desc),note2:plain(B2.notes[0].desc),
        cause1:B1.audit.claims[0].conclusion,cause2:B2.audit.claims[0].conclusion,
      },
      C:{
        raw1:c1.elementProfiles.raw,raw2:c2.elementProfiles.raw,
        influence1:c1.elementProfiles.influence,influence2:c2.elementProfiles.influence,
        fp1:C1.audit.structureFingerprint,fp2:C2.audit.structureFingerprint,
        note1:plain(C1.notes[0].desc),note2:plain(C2.notes[0].desc),
      },
      D:{
        structure1:D1.audit.structureFingerprint,structure2:D2.audit.structureFingerprint,
        timing1:D1.audit.timingFingerprint,timing2:D2.audit.timingFingerprint,
        baseClaim1:D1.audit.claims[0].conclusion,baseClaim2:D2.audit.claims[0].conclusion,
        timingText1:plain(D1.notes[6].desc),timingText2:plain(D2.notes[6].desc),
      },
      E:{
        structure1:E1.audit.structureFingerprint,structure2:E2.audit.structureFingerprint,
        claims1:E1.audit.claims.slice(0,5).map(x=>x.conclusion),
        claims2:E2.audit.claims.slice(0,5).map(x=>x.conclusion),
        noteMoney:plain(E1.notes[2].desc),noteLove:plain(E2.notes[2].desc),
      },
      F:{
        conflicts:F.reasoning.integrated.conflicts,
        priority:F.reasoning.integrated.priorityPolicy,
        claim:F.audit.claims[2],
      },
      G:{
        unsupported:G.audit.unsupported,
        special:G.reasoning.ditian.findings.find(x=>x.id==='DTS_SPECIAL_120')||null,
        note:plain(G.notes[0].desc),
      },
      runtimeIntegrity:{
        ditianKinds:A1.reasoning.ditian.findings.map(x=>({id:x.id,kind:x.kind})),
        bridgeChartKinds:BRIDGE.reasoning.ditian.findings.map(x=>({id:x.id,kind:x.kind,facts:x.facts})),
        claims:(A1.audit.outputClaimMap||[]).map(link=>{
          const claim=A1.audit.claims[link.claimNum-1];
          return {
            noteNum:link.noteNum,
            claimNum:link.claimNum,
            ditianRuleIds:claim?.ditianRuleIds||[],
            zipingRuleIds:claim?.zipingRuleIds||[],
            noteSentence:claim?.noteSentence||"",
            actualSentence:plain(A1.notes[link.noteNum-1]?.desc),
            sentenceMatches:claim?.noteSentence===plain(A1.notes[link.noteNum-1]?.desc),
          };
        }),
      },
      versions:{
        note:globalThis.__CONCERN_NOTE_ENGINE_V2__?.version,
        profile:globalThis.__INTEGRATED_SAJU_PROFILE_V1__?.version,
        reasoning:globalThis.__CLASSICAL_REASONING_V1__?.version,
      }
    };
  });

  assert(r.versions.note==='6.2.0'&&r.versions.profile==='2.1.0'&&r.versions.reasoning==='2.1.1','v3 runtime versions missing');

  const requiredKinds=['strength','root','flow','pressure'];
  for(const kind of requiredKinds){
    assert(r.runtimeIntegrity.ditianKinds.some(x=>x.kind===kind), 'runtime Ditian finding kind missing: '+kind+' '+JSON.stringify(r.runtimeIntegrity.ditianKinds));
  }
  const bridgeFinding=r.runtimeIntegrity.bridgeChartKinds.find(x=>x.id==='DTS_BRIDGE_112');
  assert(bridgeFinding?.kind==='bridge','runtime bridge finding kind missing: '+JSON.stringify(r.runtimeIntegrity.bridgeChartKinds));
  assert(bridgeFinding?.facts?.bridge,'runtime bridge finding has no bridge facts: '+JSON.stringify(bridgeFinding));
  assert(r.runtimeIntegrity.claims.length===6,'six internal causal claims missing');
  for(const claim of r.runtimeIntegrity.claims){
    assert(claim.ditianRuleIds.filter(Boolean).length>0,'answer '+claim.noteNum+': no valid Ditian provenance');
    assert(claim.zipingRuleIds.filter(Boolean).length>0,'answer '+claim.noteNum+': no valid Ziping provenance');
    assert(claim.noteSentence && claim.sentenceMatches,'answer '+claim.noteNum+': audit noteSentence is not the actual rendered answer');
  }

  assert(r.A.sameDay && r.A.month1!==r.A.month2,'A setup invalid');
  assert(r.A.fp1!==r.A.fp2,'A: different month command did not change structural reasoning');
  assert(r.A.note1!==r.A.note2,'A: different month command did not materially change NOTE');

  assert(r.B.root1?.quality!==r.B.root2?.quality,'B: root quality did not differ');
  assert(r.B.root1?.rootCount>r.B.root2?.rootCount,'B: root presence/absence was not preserved');
  assert(r.B.cause1!==r.B.cause2 && r.B.note1!==r.B.note2,'B: roots did not alter causal conclusion');

  assert(JSON.stringify(r.C.raw1)===JSON.stringify(r.C.raw2),'C setup invalid: visible five-element counts differ');
  assert(JSON.stringify(r.C.influence1)!==JSON.stringify(r.C.influence2),'C: month/hidden influence did not differ');
  assert(r.C.fp1!==r.C.fp2 && r.C.note1!==r.C.note2,'C: identical raw counts collapsed to same reasoning');

  assert(r.D.structure1===r.D.structure2,'D: changing Daewoon changed natal structure');
  assert(r.D.baseClaim1===r.D.baseClaim2,'D: changing Daewoon changed base natal claim');
  assert(r.D.timing1!==r.D.timing2 && r.D.timingText1!==r.D.timingText2,'D: Daewoon did not change timing only');

  assert(r.E.structure1===r.E.structure2,'E: changing concern changed natal structure');
  assert(JSON.stringify(r.E.claims1)===JSON.stringify(r.E.claims2),'E: concern changed core causal claims');
  assert(r.E.noteMoney!==r.E.noteLove,'E: concern application did not change domain NOTE');

  assert(r.F.conflicts.length>0,'F: expected Ditian/Ziping conflict was not preserved');
  assert(/평균/.test(r.F.priority) || /순서/.test(r.F.priority),'F: conflict priority policy missing');
  assert(r.F.claim?.ditianRuleIds?.length && r.F.claim?.zipingRuleIds?.length,'F: conflict claim lost provenance');

  assert(r.G.special?.implementationStatus==='unimplemented','G: special structure must remain unimplemented');
  assert(r.G.unsupported.some(x=>x.ruleId==='DTS_SPECIAL_120'),'G: unsupported special rule not surfaced');
  assert(!/종격|가종|전왕/.test(r.G.note),'G: unimplemented special structure leaked as a user-facing assertion');

  assert(errors.length===0,'browser errors: '+errors.join(' | '));
  console.log('CLASSICAL_RUNTIME_KINDS',JSON.stringify({
    base:r.runtimeIntegrity.ditianKinds,
    bridgeCase:r.runtimeIntegrity.bridgeChartKinds,
  }));
  console.log('CLASSICAL_NOTE_PROVENANCE',JSON.stringify(r.runtimeIntegrity.claims.map(x=>({
    noteNum:x.noteNum,
    ditianRuleIds:x.ditianRuleIds,
    zipingRuleIds:x.zipingRuleIds,
    sentenceMatches:x.sentenceMatches,
    noteSentence:x.noteSentence,
  }))));
  console.log('CLASSICAL_REASONING_A_G_PASS',JSON.stringify({
    A:true,B:true,C:true,D:true,E:true,F:r.F.conflicts.length,G:r.G.unsupported.map(x=>x.ruleId)
  }));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
