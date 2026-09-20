const { chromium } = require('playwright');

function assert(cond,msg){ if(!cond) throw new Error(msg); }

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push('[pageerror] '+(e.stack||e.message)));
  page.on('console',m=>{ if(m.type()==='error') errors.push('[console] '+m.text()); });
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'load'});
  await page.waitForFunction(() =>
    globalThis.__CLASSICAL_ENGINE_V2__?.version==='2.2.0' &&
    globalThis.__INTEGRATED_SAJU_PROFILE_V1__?.version==='2.1.0' &&
    globalThis.__CLASSICAL_REASONING_V1__?.version==='1.1.0' &&
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version==='3.1.0'
  );

  const r=await page.evaluate(()=>{
    const E=globalThis.__CLASSICAL_ENGINE_V2__;
    const POS=['year','month','day','hour'];
    const DAY_ELEMENT={甲:'mok',乙:'mok',丙:'hwa',丁:'hwa',戊:'to',己:'to',庚:'geum',辛:'geum',壬:'su',癸:'su'};
    const plain=v=>String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const clone=v=>JSON.parse(JSON.stringify(v));

    function sipsinData(pillars){
      const all=[],by={},count={};
      const dayGan=pillars.day.gan;
      for(const pos of POS){
        const p=pillars[pos]; if(!p) continue;
        const ganGod=pos==='day'?'일간':E.tenGod(dayGan,p.gan);
        const main=E.hidden[p.zhi]?.[0]||'';
        const zhiGod=main?E.tenGod(dayGan,main):'';
        by[pos]={gan:ganGod,zhi:zhiGod};
        if(pos!=='day'&&ganGod) all.push({pillar:pos,position:'천간',value:ganGod});
        if(zhiGod) all.push({pillar:pos,position:'지지',value:zhiGod});
      }
      for(const row of all) count[row.value]=(count[row.value]||0)+1;
      return {all,by,count,dominant:Object.entries(count).sort((a,b)=>b[1]-a[1])[0]?.[0]||''};
    }

    function monthRows(dayGan,year,seed){
      const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'];
      const zhis=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
      return stems.map((gan,idx)=>{
        const month=((idx+1)%12)+1;
        const startDay=idx%2?6:5;
        const nextMonth=month===12?1:month+1;
        const endYear=month===12?year+1:year;
        const actualGan=stems[(idx+(seed||0))%stems.length];
        return {
          idx,zhi:zhis[idx],ganZhi:actualGan+zhis[idx],sipsin:E.tenGod(dayGan,actualGan),
          startYmd:String(year)+'-'+String(month).padStart(2,'0')+'-'+String(startDay).padStart(2,'0'),
          startYear:year,startMonth:month,startDay,
          endYmd:String(endYear)+'-'+String(nextMonth).padStart(2,'0')+'-04',
          endYear,endMonth:nextMonth,endDay:4,
        };
      });
    }

    function timingSet(dayGan,opts={}){
      const out={};
      for(let year=2026;year<=2031;year++){
        const daeun=opts.daeunByYear?.[year]||opts.daeun||'癸亥';
        const seyun=opts.seyunByYear?.[year]||opts.seyun||(['丙午','丁未','戊申','己酉','庚戌','辛亥'][year-2026]);
        const months=monthRows(dayGan,year,opts.monthSeed||0);
        if(opts.monthOverrideYear===year && opts.monthOverride){
          Object.assign(months[opts.monthOverride.idx||0],opts.monthOverride);
          const gan=String(months[opts.monthOverride.idx||0].ganZhi||'').charAt(0);
          months[opts.monthOverride.idx||0].sipsin=E.tenGod(dayGan,gan);
        }
        out['y'+year]={
          year,daeunGanZhi:daeun,seyunGanZhi:seyun,seyunGanSipsin:E.tenGod(dayGan,seyun.charAt(0)),wolun:months,
        };
      }
      return out;
    }

    function mk(pillars,opts={}){
      const ep=getElementProfilesV2(pillars);
      const st=analyzeDayMasterStrengthV2({pillars});
      const gg=determineGyeokgukFromPillarsV2(pillars,opts.calendarMeta||{});
      const ss=sipsinData(pillars);
      const gs=evaluateGyeokStatusV2(gg,ss.by);
      const ys=selectYongshinV2({pillars,strength:st,elementProfiles:ep,gyeokguk:gg});
      const realYeonun=opts.realYeonun||timingSet(pillars.day.gan,opts.timingOpts||{});
      const classical=buildClassicalLayersV2({pillars,strength:st,elementProfiles:ep,gyeokguk:gg,yongshinDetail:ys,calendarMeta:opts.calendarMeta||{}});
      return {
        pillars,dayOheng:DAY_ELEMENT[pillars.day.gan],
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
          relations:{hasChung:false},stats:{},classical,timing:{yeonun:realYeonun},
        },
        elements:ep.raw,realYeonun,concernKey:opts.concernKey||'career',concernSituation:opts.concernSituation||'current',
        userGender:'female',__testNowYmd:'2026-09-20',
      };
    }

    function run(data,concern='career',situation='current',mode='F'){
      const d={...data,concernKey:concern,concernSituation:situation};
      const notes=generateConcernNotes(d,mode);
      return {data:d,reasoning:d.classicalReasoningV1,audit:d.noteV3Audit,notes};
    }
    function finding(run,id){return run.reasoning.ditian.findings.find(x=>x.id===id)||run.reasoning.ziping.findings.find(x=>x.id===id)||null;}
    function zmain(run){return run.reasoning.ziping.findings.find(x=>x.id!=='ZZ_MONTH_101'&&x.implementationStatus!=='unimplemented')||run.reasoning.ziping.findings.find(x=>x.id==='ZZ_MONTH_101');}
    function sorted(v){return [...new Set(v||[])].sort();}
    function provenanceCheck(run){
      const all=[...run.reasoning.ditian.findings,...run.reasoning.ziping.findings];
      const byId=Object.fromEntries(all.map(x=>[x.id,x]));
      return run.audit.claims.map((claim,i)=>{
        const ids=[...(claim.ditianRuleIds||[]),...(claim.zipingRuleIds||[])];
        const refs=ids.map(id=>byId[id]).filter(Boolean);
        const expectedConditions=sorted(refs.flatMap(x=>x.conditions||[]));
        const expectedExceptions=sorted(refs.flatMap(x=>x.exceptions||[]));
        return {
          noteNum:claim.noteNum,
          idsExist:ids.length===refs.length && ids.length>0,
          noFallback:claim.ditianRuleIds.length<run.reasoning.ditian.findings.length || claim.zipingRuleIds.length<run.reasoning.ziping.findings.length,
          conditionsMatch:JSON.stringify(sorted(claim.conditions))===JSON.stringify(expectedConditions),
          exceptionsMatch:JSON.stringify(sorted(claim.exceptions))===JSON.stringify(expectedExceptions),
          causalSteps:claim.causalSteps||[],
          evidenceStatus:claim.evidenceStatus,
          sentenceMatches:claim.noteSentence===plain(run.notes[i]?.desc),
        };
      });
    }

    // 1) Same visible five-element counts, different month command.
    const rawA=mk({year:{gan:'甲',zhi:'子'},month:{gan:'丙',zhi:'寅'},day:{gan:'戊',zhi:'辰'},hour:{gan:'庚',zhi:'申'}});
    const rawB=mk({year:{gan:'甲',zhi:'寅'},month:{gan:'丙',zhi:'子'},day:{gan:'戊',zhi:'辰'},hour:{gan:'庚',zhi:'申'}});
    const RAW_A=run(rawA), RAW_B=run(rawB);

    // 2) Same month and same full raw element multiset, root position only moved day -> year.
    const rootDay=mk({year:{gan:'丙',zhi:'戌'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'寅'},hour:{gan:'戊',zhi:'午'}});
    const rootYear=mk({year:{gan:'丙',zhi:'寅'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'戌'},hour:{gan:'戊',zhi:'午'}});
    const ROOT_DAY=run(rootDay),ROOT_YEAR=run(rootYear);

    // 3) Same visible element counts and same 正官格; only exact month-basis stem exposure differs (辛 vs 庚).
    const touchPresent=mk({year:{gan:'辛',zhi:'子'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'丙',zhi:'午'}});
    const touchAbsent=mk({year:{gan:'庚',zhi:'子'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'丙',zhi:'午'}});
    const TOUCH_P=run(touchPresent),TOUCH_A=run(touchAbsent);

    // 4) Same 正官格, sangsin present vs absent.
    const sangPresent=run(mk({year:{gan:'戊',zhi:'子'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'乙',zhi:'亥'}}));
    const sangAbsent=run(mk({year:{gan:'丙',zhi:'子'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'乙',zhi:'亥'}}));

    // 5) Same 正官格, gisin 상관 present vs absent.
    const gisinPresent=run(mk({year:{gan:'丁',zhi:'子'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'乙',zhi:'亥'}}));
    const gisinAbsent=run(mk({year:{gan:'丙',zhi:'子'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'乙',zhi:'亥'}}));

    // 6) 正官 damaged by 상관; rescue 인성 present vs absent.
    const rescuePresent=run(mk({year:{gan:'丁',zhi:'午'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'癸',zhi:'亥'}}));
    const rescueAbsent=run(mk({year:{gan:'丁',zhi:'午'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'乙',zhi:'亥'}}));

    // 7) Bridge missing vs bridge element present-candidate. Do not assert full effect.
    const bridgeMissing=run(mk({year:{gan:'甲',zhi:'卯'},month:{gan:'戊',zhi:'辰'},day:{gan:'甲',zhi:'卯'},hour:{gan:'己',zhi:'丑'}}));
    const bridgePresent=run(mk({year:{gan:'甲',zhi:'卯'},month:{gan:'戊',zhi:'辰'},day:{gan:'甲',zhi:'卯'},hour:{gan:'己',zhi:'午'}}));

    // 8) Stem combine exists, transformation must remain not-evaluated/detect-only.
    const combineCase=run(mk({year:{gan:'己',zhi:'子'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'辰'},hour:{gan:'丙',zhi:'午'}}));

    // 9) Extreme special candidate stays unimplemented.
    const specialCase=run(mk({year:{gan:'庚',zhi:'申'},month:{gan:'庚',zhi:'酉'},day:{gan:'甲',zhi:'午'},hour:{gan:'丙',zhi:'午'}}));

    // 10-12) Same natal, change only Daewoon / Seyun / Wolun.
    const timingP={year:{gan:'戊',zhi:'午'},month:{gan:'辛',zhi:'酉'},day:{gan:'甲',zhi:'子'},hour:{gan:'己',zhi:'未'}};
    const tBase=timingSet('甲');
    const tDae=clone(tBase); for(const key of Object.keys(tDae)) tDae[key].daeunGanZhi='庚申';
    const tSey=clone(tBase); tSey.y2027.seyunGanZhi='庚申'; tSey.y2027.seyunGanSipsin=E.tenGod('甲','庚');
    const tWol=clone(tBase); tWol.y2026.wolun[8].ganZhi='庚申'; tWol.y2026.wolun[8].sipsin=E.tenGod('甲','庚');
    const TIME_BASE=run(mk(timingP,{realYeonun:tBase}));
    const TIME_DAE=run(mk(timingP,{realYeonun:tDae}));
    const TIME_SEY=run(mk(timingP,{realYeonun:tSey}));
    const TIME_WOL=run(mk(timingP,{realYeonun:tWol}));

    // 13) Same saju across all six concerns.
    const concernKeys=['money','career','love','path','people','mental'];
    const concernSituations={money:'saving',career:'current',love:'relationship',path:'current',people:'friend',mental:'burnout'};
    const concernRuns=concernKeys.map(c=>run(mk(timingP),c,concernSituations[c]));

    // 14) Legacy yongshin score mutation must not change classical prescription or NOTE4.
    const legacyA=mk(timingP);
    const legacyB=clone(legacyA);
    legacyB.yongshin='su';
    legacyB.yongshinDetail={primary:'su',secondary:'mok',avoid:'hwa',scores:{mok:99,hwa:-99,to:5,geum:1,su:100},detail:{},bridge:null,method:'mutated-compat'};
    legacyB.analysisProfile.yongshinDetail=clone(legacyB.yongshinDetail);
    legacyB.analysisProfile.classical.yongshin={primary:'su',secondary:'mok',avoid:'hwa',scores:legacyB.yongshinDetail.scores,detail:{}};
    const LEG_A=run(legacyA),LEG_B=run(legacyB);

    // 15) Transit branch clash on a weak/rooted chart must create a traceable root-clash signal.
    const transitRootP={year:{gan:'丙',zhi:'子'},month:{gan:'辛',zhi:'酉'},day:{gan:'甲',zhi:'寅'},hour:{gan:'戊',zhi:'亥'}};
    const rootTiming=timingSet('甲',{seyun:'庚申'});
    const TRANSIT_ROOT=run(mk(transitRootP,{realYeonun:rootTiming}));

    // 16) Real runtime timing: canonical chart gets current-year..+5 data from calculateAccurateManse.
    const canonical=calculateAccurateManse(1998,2,21,'03:10','female');
    canonical.__testNowYmd='2026-09-20';
    canonical.concernKey='career'; canonical.concernSituation='current';
    const CANON=run(canonical,'career','current');

    function trace(name,run){
      const main=zmain(run);
      return {
        name,
        pillars:run.reasoning.profile.pillars,
        raw:run.reasoning.profile.elements.raw,
        influence:run.reasoning.profile.elements.influence,
        strength:{
          verdict:run.reasoning.profile.strength.verdict,
          ratio:run.reasoning.profile.strength.supportRatio,
          deukryeong:run.reasoning.profile.strength.deukryeong,
          deukji:run.reasoning.profile.strength.deukji,
          deukse:run.reasoning.profile.strength.deukse,
        },
        ditian:run.reasoning.ditian.findings.filter(x=>!['DTS_COMBINE_121','DTS_BRANCH_COMBINE_122'].includes(x.id)).slice(0,8).map(x=>({id:x.id,kind:x.kind,conclusion:x.conclusion})),
        ziping:main?{id:main.id,state:main.state,causalSteps:main.causalSteps,conclusion:main.conclusion}:null,
        cross:{priority:run.reasoning.integrated.priorityPolicy,prescription:run.reasoning.integrated.prescription},
        notes:run.notes.map((n,i)=>({note:i+1,text:plain(n.desc)})),
      };
    }

    return {
      rawMonth:{
        sameRaw:JSON.stringify(rawA.elementProfiles.raw)===JSON.stringify(rawB.elementProfiles.raw),
        monthA:rawA.pillars.month.zhi,monthB:rawB.pillars.month.zhi,
        forceA:rawA.elementProfiles.influence,forceB:rawB.elementProfiles.influence,
        seasonA:finding(RAW_A,'DTS_SEASON_102'),seasonB:finding(RAW_B,'DTS_SEASON_102'),
        fpA:RAW_A.audit.structureFingerprint,fpB:RAW_B.audit.structureFingerprint,
      },
      rootPosition:{
        sameRaw:JSON.stringify(rootDay.elementProfiles.raw)===JSON.stringify(rootYear.elementProfiles.raw),
        monthSame:rootDay.pillars.month.zhi===rootYear.pillars.month.zhi,
        day:finding(ROOT_DAY,'DTS_GROUND_103'),year:finding(ROOT_YEAR,'DTS_GROUND_103'),
        rootDay:finding(ROOT_DAY,'DTS_ROOT_104'),rootYear:finding(ROOT_YEAR,'DTS_ROOT_104'),
      },
      touchul:{
        sameRaw:JSON.stringify(touchPresent.elementProfiles.raw)===JSON.stringify(touchAbsent.elementProfiles.raw),
        gyeokP:touchPresent.gyeokguk.name,gyeokA:touchAbsent.gyeokguk.name,
        touchP:touchPresent.gyeokguk.touchul,touchA:touchAbsent.gyeokguk.touchul,
        monthP:finding(TOUCH_P,'ZZ_MONTH_101'),monthA:finding(TOUCH_A,'ZZ_MONTH_101'),
      },
      sangsin:{
        ruleP:zmain(sangPresent),ruleA:zmain(sangAbsent),
      },
      gisin:{
        ruleP:zmain(gisinPresent),ruleA:zmain(gisinAbsent),
      },
      rescue:{
        with:zmain(rescuePresent),without:zmain(rescueAbsent),
      },
      bridge:{
        missing:finding(bridgeMissing,'DTS_BRIDGE_112'),
        present:finding(bridgePresent,'DTS_BRIDGE_112'),
      },
      combine:{
        finding:finding(combineCase,'DTS_COMBINE_121'),
        context:combineCase.reasoning.context.stemCombines,
      },
      special:{
        finding:finding(specialCase,'DTS_SPECIAL_120'),
        unsupported:specialCase.audit.unsupported,
      },
      timing:{
        natal:[TIME_BASE,TIME_DAE,TIME_SEY,TIME_WOL].map(x=>x.audit.structureFingerprint),
        fps:[TIME_BASE,TIME_DAE,TIME_SEY,TIME_WOL].map(x=>x.audit.timingFingerprint),
        daeBase:TIME_BASE.reasoning.timing.years.find(x=>x.year===2026),
        daeChanged:TIME_DAE.reasoning.timing.years.find(x=>x.year===2026),
        seyBase:TIME_BASE.reasoning.timing.years.find(x=>x.year===2027),
        seyChanged:TIME_SEY.reasoning.timing.years.find(x=>x.year===2027),
        wolBase:TIME_BASE.reasoning.timing.nearMonths.find(x=>x.startYmd===tBase.y2026.wolun[8].startYmd),
        wolChanged:TIME_WOL.reasoning.timing.nearMonths.find(x=>x.startYmd===tWol.y2026.wolun[8].startYmd),
      },
      concerns:concernRuns.map((x,i)=>({
        concern:concernKeys[i],fp:x.audit.structureFingerprint,
        coreClaims:x.audit.claims.slice(0,5).map(c=>c.conclusion),
        note5:plain(x.notes[4].desc),
      })),
      provenance:provenanceCheck(CANON),
      legacy:{
        fpA:LEG_A.audit.structureFingerprint,fpB:LEG_B.audit.structureFingerprint,
        prescriptionA:LEG_A.reasoning.integrated.prescription,prescriptionB:LEG_B.reasoning.integrated.prescription,
        claim4A:LEG_A.audit.claims[3].conclusion,claim4B:LEG_B.audit.claims[3].conclusion,
        note4A:plain(LEG_A.notes[3].desc),note4B:plain(LEG_B.notes[3].desc),
      },
      transitRoot:{
        strength:TRANSIT_ROOT.reasoning.integrated.strength,
        roots:finding(TRANSIT_ROOT,'DTS_ROOT_104')?.facts,
        signals:TRANSIT_ROOT.reasoning.timing.years.flatMap(y=>[...(y.supportSignals||[]),...(y.cautionSignals||[])]),
      },
      canonicalTiming:{
        pillars:[
          canonical.pillars.year.gan+canonical.pillars.year.zhi,
          canonical.pillars.month.gan+canonical.pillars.month.zhi,
          canonical.pillars.day.gan+canonical.pillars.day.zhi,
          canonical.pillars.hour.gan+canonical.pillars.hour.zhi,
        ],
        raw:canonical.elementProfiles.raw,
        today:CANON.reasoning.timing.today,
        detailEnd:CANON.reasoning.timing.detailEnd,
        horizonEnd:CANON.reasoning.timing.horizonEnd,
        nearMonthCount:CANON.reasoning.timing.nearMonths.length,
        years:CANON.reasoning.timing.years.map(y=>({year:y.year,daeunGanZhi:y.daeunGanZhi,seyunGanZhi:y.seyunGanZhi,score:y.score,class:y.class})),
        turningPoints:CANON.reasoning.timing.turningPoints,
        note6:plain(CANON.notes[5].desc),
        note6Meta:CANON.notes[5].__timingQA,
      },
      traces:[
        trace('canonical-weak-officer',CANON),
        trace('root-day',ROOT_DAY),
        trace('officer-damage-rescue',rescuePresent),
        trace('bridge-missing',bridgeMissing),
        trace('special-candidate',specialCase),
      ],
      versions:{
        classical:E.version,integrated:globalThis.__INTEGRATED_SAJU_PROFILE_V1__?.version,
        reasoning:globalThis.__CLASSICAL_REASONING_V1__?.version,note:globalThis.__CONCERN_NOTE_ENGINE_V2__?.version,
      },
    };
  });

  assert(r.versions.classical==='2.2.0'&&r.versions.integrated==='2.1.0'&&r.versions.reasoning==='1.1.0'&&r.versions.note==='3.1.0','depth runtime version mismatch');

  assert(r.rawMonth.sameRaw,'same-visible-count month test setup drift');
  assert(r.rawMonth.monthA!==r.rawMonth.monthB,'month test must change month command');
  assert(JSON.stringify(r.rawMonth.forceA)!==JSON.stringify(r.rawMonth.forceB),'different month/hidden force collapsed');
  assert(r.rawMonth.fpA!==r.rawMonth.fpB,'different month did not alter structural fingerprint');
  assert(r.rawMonth.seasonA?.id==='DTS_SEASON_102'&&r.rawMonth.seasonB?.id==='DTS_SEASON_102','month facts did not fire explicit season rule');

  assert(r.rootPosition.sameRaw&&r.rootPosition.monthSame,'root-position test changed raw counts or month');
  assert(r.rootPosition.day?.facts?.quality==='day-rooted','day-rooted fixture did not produce day root');
  assert(r.rootPosition.year?.facts?.quality==='other-rooted','year-rooted fixture did not produce other root');
  assert(r.rootPosition.rootDay?.conclusion!==r.rootPosition.rootYear?.conclusion,'root position did not alter Ditian root conclusion');

  assert(r.touchul.sameRaw,'touchul test must keep visible five-element counts');
  assert(r.touchul.gyeokP===r.touchul.gyeokA,'touchul changed gyeok');
  assert(r.touchul.touchP===true&&r.touchul.touchA===false,'touchul presence/absence not isolated');
  assert(r.touchul.monthP?.facts?.touchul===true&&r.touchul.monthA?.facts?.touchul===false,'Ziping month finding lost touchul fact');

  assert(r.sangsin.ruleP?.gyeokName==='정관격'&&r.sangsin.ruleA?.gyeokName==='정관격','sangsin fixtures changed gyeok');
  assert((r.sangsin.ruleP.supportGods||[]).length>(r.sangsin.ruleA.supportGods||[]).length,'sangsin presence not reflected in support gods');

  assert(r.gisin.ruleP?.harmGods?.includes('상관'),'gisin fixture did not fire harm god');
  assert(!(r.gisin.ruleA?.harmGods||[]).includes('상관'),'gisin-absent fixture still has harm god');
  assert(['파격','성중유패'].includes(r.gisin.ruleP?.sequenceStatus),'gisin damage did not record classical sequence status');

  assert(r.rescue.with?.state==='rescued'||r.rescue.with?.rescueGods?.length>0,'damage+rescue fixture did not preserve rescue');
  assert(/구응/.test(r.rescue.with?.sequenceStatus||''),'damage+rescue did not record 구응 sequence status');
  assert((r.rescue.with?.causalSteps||[]).some(x=>x.step==='damage')&&(r.rescue.with?.causalSteps||[]).some(x=>x.step==='rescue'),'rescue causal sequence missing damage -> rescue');
  assert(!(r.rescue.without?.causalSteps||[]).some(x=>x.step==='rescue'),'rescue-absent fixture invented rescue');

  assert(r.bridge.missing?.facts?.bridge==='hwa'&&r.bridge.missing?.facts?.status==='missing','bridge-missing boundary failed');
  assert(r.bridge.present?.facts?.bridge==='hwa'&&r.bridge.present?.facts?.status==='present-candidate','bridge-present must remain candidate, not proven effect');
  assert(!('established' in (r.bridge.present?.facts||{})),'bridge should not expose false established boolean');

  assert(r.combine.finding?.implementationStatus==='detect-only','stem combine must remain detect-only');
  assert(r.combine.context?.some(x=>x.transformationStatus==='not-evaluated'),'stem combine transformation status must remain not-evaluated');

  assert(r.special.finding?.implementationStatus==='unimplemented','special structure candidate must remain unimplemented');
  assert(r.special.unsupported.some(x=>x.ruleId==='DTS_SPECIAL_120'),'special unimplemented provenance missing');

  assert(new Set(r.timing.natal).size===1,'changing transit data changed natal structure');
  assert(r.timing.fps[0]!==r.timing.fps[1],'different Daewoon did not change timing fingerprint');
  assert(r.timing.fps[0]!==r.timing.fps[2],'different Seyun did not change timing fingerprint');
  assert(r.timing.fps[0]!==r.timing.fps[3],'different Wolun did not change timing fingerprint');
  assert(r.timing.daeBase?.daeunGanZhi!==r.timing.daeChanged?.daeunGanZhi,'Daewoon raw fact did not change');
  assert(r.timing.seyBase?.seyunGanZhi!==r.timing.seyChanged?.seyunGanZhi,'Seyun raw fact did not change');
  assert(r.timing.wolBase?.ganZhi!==r.timing.wolChanged?.ganZhi,'Wolun raw fact did not change');

  assert(new Set(r.concerns.map(x=>x.fp)).size===1,'same saju concern changed natal fingerprint');
  assert(new Set(r.concerns.map(x=>JSON.stringify(x.coreClaims))).size===1,'same saju concern changed core NOTE1-5 conclusions');
  assert(new Set(r.concerns.map(x=>x.note5)).size>=5,'concern application layer did not change domain rendering');

  for(const p of r.provenance){
    assert(p.idsExist,'NOTE'+p.noteNum+' references a rule that did not fire');
    assert(p.noFallback,'NOTE'+p.noteNum+' looks like all-rule fallback provenance');
    assert(p.conditionsMatch,'NOTE'+p.noteNum+' conditions are not collected only from referenced rules');
    assert(p.exceptionsMatch,'NOTE'+p.noteNum+' exceptions are not collected only from referenced rules');
    assert(p.causalSteps.length>0,'NOTE'+p.noteNum+' causalSteps missing');
    assert(['sufficient','insufficient-evidence'].includes(p.evidenceStatus),'NOTE'+p.noteNum+' evidenceStatus invalid');
    assert(p.sentenceMatches,'NOTE'+p.noteNum+' noteSentence not bound to actual rendered text');
  }

  assert(r.legacy.fpA===r.legacy.fpB,'legacy yongshin heuristic leaked into structural fingerprint');
  assert(JSON.stringify(r.legacy.prescriptionA)===JSON.stringify(r.legacy.prescriptionB),'legacy yongshin heuristic changed classical prescription');
  assert(r.legacy.claim4A===r.legacy.claim4B&&r.legacy.note4A===r.legacy.note4B,'legacy yongshin heuristic changed NOTE4');

  assert(r.transitRoot.strength==='신약','transit-root fixture must be weak');
  assert(r.transitRoot.signals.some(x=>x.code==='root-clash'),'transit branch clash did not fire traceable root-clash caution');

  assert(r.traces[0]?.ziping?.state!=='damaged','canonical 正官 must not be auto-damaged by conditional 破 alone');
  assert((r.traces[0]?.ziping?.causalSteps||[]).some(x=>x.step==='conditional-relation'),'canonical conditional relation should remain observable without automatic damage');

  assert(r.canonicalTiming.pillars.join(',')==='戊寅,甲寅,己亥,乙丑','canonical pillars drift');
  assert(JSON.stringify(r.canonicalTiming.raw)===JSON.stringify({mok:4,hwa:0,to:3,geum:0,su:1}),'canonical raw elements drift');
  assert(r.canonicalTiming.nearMonthCount>=18,'rolling horizon does not provide ~18 months of monthly detail: '+r.canonicalTiming.nearMonthCount);
  assert(r.canonicalTiming.years.length>=5,'five-year annual timing coverage missing');
  assert((r.canonicalTiming.turningPoints.opportunities||[]).length<=3&&(r.canonicalTiming.turningPoints.cautions||[]).length<=2,'turning-point caps violated');
  assert(/가까운 시기 상세/.test(r.canonicalTiming.note6)&&/이후 큰 흐름/.test(r.canonicalTiming.note6)&&/핵심 변곡점/.test(r.canonicalTiming.note6),'NOTE6 user hierarchy missing');
  assert(!/(대운|세운|월운|원국|격국|용신|상신|기신|통관)/.test(r.canonicalTiming.note6),'NOTE6 leaked internal jargon');

  assert(r.traces.length>=5,'need at least five runtime trace samples');
  assert(errors.length===0,'browser errors: '+errors.join(' | '));

  console.log('CLASSICAL_DEPTH_V31_PASS',JSON.stringify({
    rawMonth:true,rootPosition:true,touchul:true,sangsin:true,gisin:true,rescue:true,bridge:true,combine:true,special:true,
    daeun:true,seyun:true,wolun:true,concerns:true,provenance:true,legacyIndependence:true,rollingTiming:true
  }));
  console.log('CLASSICAL_DEPTH_TRACE_SAMPLES',JSON.stringify(r.traces));
  console.log('NOTE6_FIVE_YEAR_SAMPLE',JSON.stringify(r.canonicalTiming));
  console.log('CLASSICAL_DEPTH_UNIMPLEMENTED',JSON.stringify({
    special:r.special.unsupported,
    stemCombine:r.combine.finding,
  }));

  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1);});
