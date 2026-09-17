from pathlib import Path
p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
old = '''        note1Valid:!!(n1?.title && n1?.desc && n1?.checklist && n1.desc.includes('언니가 잡은 사주 근거')),
        note2Valid:!!(n2?.title && n2?.desc && n2?.checklist && n2.desc.includes('1. 시작 신호') && n2.desc.includes('왜 반복되냐면')),
        note3Valid:!!(n3?.title && n3?.desc && n3?.checklist && n3.desc.includes('내가 문제라고 느끼는 지점:') && n3.desc.includes('실제로 새는 지점:') && n3.desc.includes('언니가 잡은 계산 근거')),
        note3Integrated:!!(notes?.[2]?.title === n3.title && notes?.[2]?.desc === n3.desc && notes?.[2]?.checklist === n3.checklist),
        note6Valid:!!(notes?.[5]?.desc && notes[5].desc.includes('2026') && notes[5].desc.includes('2027')),
'''
new = '''        note1Valid:!!(n1?.title && n1?.desc && n1?.checklist),
        note2Valid:!!(n2?.title && n2?.desc && n2?.checklist),
        note3Valid:!!(n3?.title && n3?.desc && n3?.checklist && n3.badge?.includes('놓친 포인트')),
        note3Integrated:!!(notes?.[2]?.title === n3.title && notes?.[2]?.desc === n3.desc && notes?.[2]?.checklist === n3.checklist),
        note4Valid:!!(notes?.[3]?.title && notes?.[3]?.desc && notes?.[3]?.checklist && notes?.[3]?.badge?.includes('7일 처방')),
        note5Valid:!!(notes?.[4]?.title && notes?.[4]?.desc && notes?.[4]?.checklist && notes?.[4]?.badge?.includes('사람 필터')),
        note6Valid:!!(notes?.[5]?.title && notes?.[5]?.desc && notes?.[5]?.checklist && notes[5].desc.includes('2026') && notes[5].desc.includes('2027')),
        forbiddenVisible:[
          '언니가 잡은 사주 근거','언니가 잡은 계산 근거','왜 이 처방이 너한테 맞나','왜 이런 필터가 맞나','타이밍 읽는 법',
          '개수는 원국 겉글자 기준','한국 만세력 기준','시간 -30분 보정'
        ].some(x => visible.includes(x)),
'''
if s.count(old) != 1:
    raise SystemExit('old NOTE UI validation block not found')
s = s.replace(old, new, 1)

old = '''        pillarBasis:document.getElementById('pillarBasisTag')?.innerText || '',
        ohengText:document.getElementById('ohengBarContainer')?.innerText || '',
'''
new = '''        pillarBasisExists:!!document.getElementById('pillarBasisTag'),
        ohengText:document.getElementById('ohengBarContainer')?.innerText || '',
'''
if s.count(old) != 1:
    raise SystemExit('pillar basis report block not found')
s = s.replace(old, new, 1)

old = '''    assert(report.note1Valid, `${c.id}: NOTE1 structure/evidence block missing`);
    assert(report.note2Valid, `${c.id}: NOTE2 structure/reason block missing`);
    assert(report.note3Valid, `${c.id}: NOTE3 blind-spot/evidence block missing`);
    assert(report.note3Integrated, `${c.id}: NOTE3 builder not integrated into generated notes`);
    assert(report.note6Valid, `${c.id}: NOTE6 2026/2027 timeline missing`);
'''
new = '''    assert(report.note1Valid, `${c.id}: NOTE1 content missing`);
    assert(report.note2Valid, `${c.id}: NOTE2 content missing`);
    assert(report.note3Valid, `${c.id}: NOTE3 content missing`);
    assert(report.note3Integrated, `${c.id}: NOTE3 builder not integrated into generated notes`);
    assert(report.note4Valid, `${c.id}: NOTE4 prescription missing`);
    assert(report.note5Valid, `${c.id}: NOTE5 people filter missing`);
    assert(report.note6Valid, `${c.id}: NOTE6 2026/2027 timeline missing`);
    assert(!report.forbiddenVisible, `${c.id}: removed meta/explanation copy leaked into UI`);
'''
if s.count(old) != 1:
    raise SystemExit('old NOTE UI assertions not found')
s = s.replace(old, new, 1)

old = '''      assert(report.pillarBasis.includes('-30분 보정'),
        `${c.id}: correction basis missing ${report.pillarBasis}`);
'''
new = '''      assert(!report.pillarBasisExists,
        `${c.id}: hidden manse-basis label leaked back into UI`);
'''
if s.count(old) != 1:
    raise SystemExit('old pillar-basis assertion not found')
s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')
print('UI_COPY_ASSERTIONS_PATCHED')
