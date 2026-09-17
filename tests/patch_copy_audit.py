from pathlib import Path
p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
start = s.find('    const note3Audit = await page.evaluate(() => {')
end = s.find('    await page.close();', start)
if start < 0 or end < 0:
    raise SystemExit('copy audit markers not found')
new = r'''    const copyAudit = await page.evaluate(() => {
      const labels = { money:'재물·돈복', career:'학업·커리어', love:'연애·썸', path:'진로·미래', people:'인간관계', mental:'번아웃·멘탈' };
      const base = calculateAccurateManse(1998,2,21,'03:10','male');
      const other = calculateAccurateManse(2001,5,6,'14:30','female');
      const out = [];
      for (const key of Object.keys(labels)) {
        for (const mode of ['F','T']) {
          const data = {
            ...base,
            concernKey:key,
            userGender:'male',
            userBirthStr:'19980221',
            rawSolutionTemplate:{ F:{acts:[]}, T:{acts:[]} },
          };
          const notes = generateConcernNotes(data, mode);
          out.push({
            key,
            mode,
            notes: notes.map((n) => ({badge:n.badge,title:n.title,desc:n.desc,checklist:n.checklist})),
          });
        }
      }
      const a = buildNoteOneInsight({ ...base, concernKey:'career' }, 'career', labels.career, false);
      const b = buildNoteOneInsight({ ...other, concernKey:'career' }, 'career', labels.career, false);
      return {
        out,
        personalized: a.desc !== b.desc,
        pageText: document.body.innerText,
      };
    });

    assert(copyAudit.out.length === 12, `copy audit set count ${copyAudit.out.length}`);
    const banned = [
      '언니가 잡은 사주 근거',
      '언니가 잡은 계산 근거',
      '왜 이 처방이 너한테 맞나',
      '왜 이런 필터가 맞나',
      '타이밍 읽는 법',
      '개수는 원국 겉글자 기준',
      '한국 만세력 기준',
      '시간 -30분 보정',
    ];
    const jargon = ['십신','격국','용신','신강','신약','월령','지장간','상신','기신','세운'];
    const fMarkers = ['언니','마음','같이','충분히','좋겠','편하','쉬어','자책','괜찮','애썼'];
    const tMarkers = ['딱','하지 마','문제야','금지','끊','정리','기준','바로','확장','데이터'];
    let fText = '';
    let tText = '';
    const summary = [];
    for (const set of copyAudit.out) {
      assert(set.notes.length === 6, `note count ${set.key}/${set.mode}: ${set.notes.length}`);
      assert(new Set(set.notes.map(n => n.title)).size === 6, `duplicate note title ${set.key}/${set.mode}`);
      const full = set.notes.map(n => `${n.badge} ${n.title} ${n.desc} ${n.checklist}`).join(' ');
      assert(!/(undefined|NaN|null)/.test(full), `bad token ${set.key}/${set.mode}`);
      for (const phrase of banned) assert(!full.includes(phrase), `banned phrase ${phrase} in ${set.key}/${set.mode}`);
      for (const phrase of jargon) assert(!full.includes(phrase), `hard jargon ${phrase} in ${set.key}/${set.mode}`);
      for (const n of set.notes) {
        assert(n.badge && n.title && n.desc && n.checklist, `empty note field ${set.key}/${set.mode}`);
      }
      if (set.mode === 'F') fText += ' ' + full; else tText += ' ' + full;
      summary.push({key:set.key, mode:set.mode, titles:set.notes.map(n=>n.title)});
    }
    for (const phrase of banned) assert(!copyAudit.pageText.includes(phrase), `banned visible UI phrase ${phrase}`);
    const fScore = fMarkers.filter(x => fText.includes(x)).length;
    const tScore = tMarkers.filter(x => tText.includes(x)).length;
    assert(fScore >= 7, `F persona too weak: ${fScore}`);
    assert(tScore >= 7, `T persona too weak: ${tScore}`);
    assert(copyAudit.personalized, 'NOTE1 did not vary across different charts');
    for (const key of Object.keys(LABELS)) {
      const f = copyAudit.out.find(x => x.key === key && x.mode === 'F');
      const t = copyAudit.out.find(x => x.key === key && x.mode === 'T');
      const sameTitles = f.notes.filter((n,i) => n.title === t.notes[i].title).length;
      assert(sameTitles <= 1, `F/T titles collapsed for ${key}: ${sameTitles}`);
      assert(f.notes.map(n=>n.desc).join('|') !== t.notes.map(n=>n.desc).join('|'), `F/T body collapsed for ${key}`);
    }
    console.log('COPY_QA_PASS', JSON.stringify({fScore,tScore,personalized:copyAudit.personalized,summary}));

'''
s = s[:start] + new + s[end:]
p.write_text(s, encoding='utf-8')
print('COPY_AUDIT_PATCHED')
