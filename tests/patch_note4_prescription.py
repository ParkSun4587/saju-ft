from pathlib import Path


def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, got {n}")
    return text.replace(old, new, 1)


# -----------------------------------------------------------------------------
# index.html: dedicated NOTE 04 prescription builder + integration
# -----------------------------------------------------------------------------
p = Path("index.html")
s = p.read_text(encoding="utf-8")

if "function buildNoteFourPrescription(" in s:
    raise SystemExit("NOTE4 builder already exists")

marker = "function generateConcernNotes(data, mode) {"
if s.count(marker) != 1:
    raise SystemExit(f"generateConcernNotes marker count={s.count(marker)}")

function_code = r'''function buildNoteFourPrescription(
  data,
  concernKey,
  concernLabel,
  isT,
) {
  const profile = data?.analysisProfile || {};
  const dayMaster = profile.dayMaster || {};
  const structure = profile.structure || {};
  const stats = data?.stats || profile.stats || {};

  const safe = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[ch]);

  let lowest = null;
  try {
    lowest = getLowestStatInfo({
      wealth: Number(stats.wealth) || 0,
      mental: Number(stats.mental) || 0,
      drive: Number(stats.drive) || 0,
      network: Number(stats.network) || 0,
    });
  } catch (_) {}
  if (!lowest) {
    const fallback = [
      { type: "wealth", name: "돈 냄새 맡는 촉", score: Number(stats.wealth) || 0 },
      { type: "mental", name: "멘탈 방어력", score: Number(stats.mental) || 0 },
      { type: "drive", name: "기회 포착력", score: Number(stats.drive) || 0 },
      { type: "network", name: "인생 역전 귀인복", score: Number(stats.network) || 0 },
    ];
    fallback.sort((a, b) => a.score - b.score);
    lowest = fallback[0];
  }

  const prescriptions = {
    money: {
      T: {
        title: "돈복 기다리지 말고 7일 안에 새는 돈부터 막는 처방",
        now: "최근 7일 결제내역을 열고 가장 자주 반복된 비필수 지출 하나를 고른 뒤, 다음 결제의 상한액을 숫자로 정해.",
        week: "7일 동안 비필수 결제는 무조건 24시간 보류해. 다음 날에도 필요하면 사고, 이유가 흐려지면 넘겨.",
        stop: "수익 인증, 친구 추천, 세일 마감만 보고 그날 바로 결제하거나 돈을 넣는 행동은 금지.",
        check: "7일 뒤 '기준 없이 쓴 돈'이 몇 번이었는지 세고, 지난주보다 횟수가 줄었으면 성공.",
        rule: "오늘 거래내역 7일치에서 가장 반복된 누수 하나에 상한선 숫자 붙이기",
      },
      F: {
        title: "불안해서 쓰는 돈과 나를 지키는 돈을 갈라놓는 7일 처방",
        now: "최근 지출 중 '필요해서 쓴 돈'과 '미안해서·지쳐서 쓴 돈'을 한 건씩만 찾아봐. 후자에는 작은 표시를 해둬.",
        week: "돈이 들어오면 금액이 작아도 먼저 '내 안전 몫'을 따로 남겨. 남을 챙기거나 기분을 달래는 소비는 그다음이야.",
        stop: "거절하면 미안할 것 같아서 대신 내주거나, 힘든 날 기분부터 달래려고 바로 결제하는 건 30분만 미뤄.",
        check: "7일 동안 내 마음과 상관없이 떠밀려 쓴 돈이 한 번이라도 줄었으면 충분히 잘한 거야.",
        rule: "오늘 지출 하나를 '필요 비용 / 미안함·불안 비용'으로 구분해서 표시하기",
      },
    },
    career: {
      T: {
        title: "준비만 더 하지 말고 결과물 하나를 밖으로 내보내는 처방",
        now: "공부·지원·업무 중 지금 제일 중요한 결과물 하나를 골라 60% 상태라도 오늘 끝낼 범위를 숫자로 정해.",
        week: "7일 안에 지원, 제출, 공개, 피드백 요청 중 하나를 실제로 실행해. 준비 시간이 아니라 밖으로 나간 결과물 수를 세는 거야.",
        stop: "새 자격증·강의·자료를 더 찾는 걸 '준비'라고 부르면서 제출 시점을 미루는 행동은 금지.",
        check: "일주일 뒤 남에게 보여준 결과물이 최소 1개 있으면 성공. 완성도보다 외부 피드백을 얻었는지가 기준이야.",
        rule: "오늘 60%짜리 결과물 하나의 제출·공개 날짜를 캘린더에 박기",
      },
      F: {
        title: "더 열심히가 아니라 내 몫을 보이게 만드는 7일 처방",
        now: "최근에 해낸 일 세 가지를 적고, 각 항목 옆에 '내가 직접 한 행동'을 한 줄씩 붙여봐.",
        week: "이번 주 한 번은 도움 요청, 역할 조정, 일정 협의 중 하나를 말로 꺼내. 혼자 다 떠안지 않는 연습이 처방이야.",
        stop: "누가 곤란해 보인다는 이유만으로 내 일정 확인도 안 하고 '제가 할게요'부터 말하는 건 잠깐 멈춰.",
        check: "7일 뒤 내 기여를 분명히 말한 장면이 1번, 남의 몫을 돌려준 장면이 1번 있으면 성공.",
        rule: "오늘 내가 만든 결과 3개와 그 안에서 내 기여를 한 줄씩 적기",
      },
    },
    love: {
      T: {
        title: "상대 분석은 줄이고 확인 질문 하나로 끝내는 연애 처방",
        now: "지금 가장 신경 쓰이는 상대 행동 하나를 '사실'과 '내 추측' 두 줄로 나눠 적어. 추측은 아직 결론이 아니야.",
        week: "7일 안에 떠보기 대신 내가 궁금한 것 또는 원하는 관계 기준을 한 문장으로 직접 확인해.",
        stop: "답장 속도, 말투, SNS만 보고 혼자 결론 낸 뒤 일부러 늦게 답하거나 거리를 두는 테스트는 금지.",
        check: "일주일 뒤 혼자 만든 가설 수보다 직접 확인한 사실 수가 많아졌으면 성공.",
        rule: "오늘 상대 행동 하나를 '사실 1줄 / 추측 1줄'로 분리해서 적기",
      },
      F: {
        title: "상대 마음을 대신 해석하지 않고 내 마음부터 말하는 7일 처방",
        now: "서운하거나 불안했던 장면 하나를 떠올리고 '상대가 한 행동'과 '내가 느낀 감정'을 따로 적어봐.",
        week: "이번 주 한 번은 괜찮은 척 넘기지 말고 '나는 이럴 때 이렇게 느껴'라는 문장으로 내 마음을 말해.",
        stop: "상대가 힘들어 보인다는 이유로 내 서운함까지 없던 일로 만들거나, 확인받으려고 더 맞춰주는 행동은 멈춰.",
        check: "7일 안에 내 감정을 숨기지 않고 말한 장면이 1번만 생겨도 성공이야.",
        rule: "오늘 서운했던 장면 하나를 '사실 / 내 감정' 두 칸으로 나눠 적기",
      },
    },
    path: {
      T: {
        title: "정답 찾기 대신 7일짜리 실험으로 진로를 검증하는 처방",
        now: "고민 중인 방향 하나를 골라 7일 안에 끝낼 수 있는 가장 작은 결과물로 바꿔. 조사 말고 실제 산출물이 있어야 해.",
        week: "7일 동안 시간·재미·반응 세 항목을 10점 만점으로 기록하고, 끝난 뒤 계속할지 버릴지 결정해.",
        stop: "비교 영상, 후기, 적성검사만 계속 보면서 직접 해보는 시점을 미루는 행동은 금지.",
        check: "일주일 뒤 '생각'이 아니라 내가 만든 결과물 1개와 점수 3개가 남아 있으면 성공.",
        rule: "오늘 고민 하나를 7일짜리 실험으로 바꾸고 결과물의 형태를 한 줄로 정하기",
      },
      F: {
        title: "남들이 안심할 답 말고 내 마음이 움직이는 쪽을 시험하는 처방",
        now: "누구에게도 설명할 필요가 없다고 가정하고 지금 끌리는 방향 하나를 적어. 현실성 평가는 그다음이야.",
        week: "그 방향에 7일 동안 하루 30분만 써봐. 인생을 확 바꾸는 게 아니라 내 반응을 확인하는 실험이면 돼.",
        stop: "가족·친구가 걱정할 장면을 미리 상상해서 내가 해보기도 전에 선택지를 지우는 건 멈춰.",
        check: "7일 뒤 '더 해보고 싶다 / 별로다 / 아직 모르겠다' 셋 중 하나를 내 경험으로 고를 수 있으면 성공이야.",
        rule: "오늘 남의 의견을 빼고 내가 궁금한 방향 하나에 30분 쓰기",
      },
    },
    people: {
      T: {
        title: "손절까지 참지 말고 첫 불편함에서 선 긋는 7일 처방",
        now: "최근 짜증났던 부탁 하나를 골라, 그때 바로 말했어야 할 기준을 한 문장으로 다시 써봐.",
        week: "이번 주 갑작스러운 부탁에는 즉답하지 말고 '확인하고 말할게'를 먼저 써. 그다음 시간·돈·체력 중 하나라도 손해면 조정해.",
        stop: "괜찮은 척 다 받아준 뒤 속으로 점수 깎다가 한 번에 차단하는 방식은 금지.",
        check: "7일 안에 관계를 끊지 않고도 작은 거절이나 조건 조정을 1번 했으면 성공.",
        rule: "오늘 불편했던 부탁 하나에 내가 지킬 기준을 한 문장으로 다시 쓰기",
      },
      F: {
        title: "상대 기분보다 내 체력을 먼저 확인하는 관계 처방",
        now: "오늘 들어온 부탁 하나를 떠올리고, 대답하기 전 내 시간·체력·마음 여유가 각각 몇 점이었는지 적어봐.",
        week: "7일 동안 부탁을 받을 때 바로 대답하지 말고 내 상태부터 확인해. 여유가 없으면 이유를 길게 설명하지 않아도 돼.",
        stop: "상대가 서운해할까 봐 내 일정과 컨디션을 무시하고 약속부터 잡는 행동은 멈춰.",
        check: "일주일 동안 '미안하지만 이번엔 어려워' 같은 작은 경계선을 1번이라도 세웠으면 성공이야.",
        rule: "오늘 부탁 하나에 답하기 전 내 시간·체력부터 먼저 확인하기",
      },
    },
    mental: {
      T: {
        title: "더 버티는 계획 말고 회복 시간을 먼저 잠그는 처방",
        now: "오늘 해야 할 일의 종료 시각을 먼저 정하고, 그 뒤 30분은 문제 해결·검색·업무 메시지를 모두 끊어.",
        week: "7일 동안 하루 한 번 '일 종료' 시간을 기록해. 못 지킨 날은 일을 더 넣지 말고 다음 날 첫 할 일을 하나 줄여.",
        stop: "쉬는 시간에 생산성 영상, 업무 검색, 할 일 정리를 하면서 그걸 휴식이라고 부르는 건 금지.",
        check: "7일 중 4일 이상 정한 종료 시각을 지켰다면 성공. 기분보다 실제 종료 횟수로 판단해.",
        rule: "오늘 일·공부 종료 시각 하나를 정하고 그 뒤 30분은 완전히 비우기",
      },
      F: {
        title: "내 감정과 남의 감정을 분리해서 마음을 쉬게 하는 7일 처방",
        now: "오늘 마음에 남은 감정 하나를 '내 문제 / 남의 문제 / 아직 모름' 셋 중 하나로만 분류해봐.",
        week: "7일 동안 하루 한 번 감정의 출처를 분류하고, 남의 문제로 표시한 건 그날 해결하려고 움직이지 않아도 돼.",
        stop: "누군가 힘들다는 말을 들은 뒤 내가 해결책을 찾아주거나 같이 가라앉을 때까지 계속 붙잡고 있는 행동은 멈춰.",
        check: "일주일 뒤 남의 감정 때문에 하루 전체가 흔들린 횟수가 한 번이라도 줄었다면 성공이야.",
        rule: "오늘 가장 오래 남은 감정 하나의 출처를 세 칸 중 하나로 분류하기",
      },
    },
  };

  const selected = prescriptions[concernKey] || prescriptions.money;
  const pattern = isT ? selected.T : selected.F;

  const strength =
    dayMaster.strength || (data?.isDayMasterStrong ? "신강" : "신약");
  const strengthGuide = {
    신강: "버티는 힘이 센 편이라 '더 하기'보다 멈출 기준을 먼저 세우는 게 핵심이야.",
    신약: "주변 자극을 많이 받는 편이라 의지로 크게 바꾸기보다 행동 단위를 작게 만들어야 오래 가.",
    중화: "한쪽 반응으로 고정되기보다 상황 영향을 받는 편이라 한 번에 변수 하나만 바꾸고 결과를 확인하는 게 좋아.",
  }[strength] || "한 번에 크게 바꾸기보다 작은 행동 하나를 반복해서 확인하는 게 좋아.";

  const weakGuideMap = {
    wealth: "손익과 내 몫을 느낌이 아니라 숫자로 끊어 보는 연습을 먼저 잡아야 해.",
    mental: "문제 해결보다 회복 시간과 감정 경계선을 먼저 확보해야 해.",
    drive: "생각을 더 늘리기보다 마감과 첫 행동을 밖에 고정하는 게 중요해.",
    network: "혼자 해결하려 하지 말고 도움 요청·협의·연결을 실제 행동으로 써야 해.",
  };
  const weakGuide = weakGuideMap[lowest.type] || "가장 약한 연결고리 하나만 먼저 보완하는 게 좋아.";

  const yongKey = data?.yongshin || "";
  const yongMap = {
    mok: { label: "목", tactic: "새 선택을 작게 시작하고 키우는 방식" },
    hwa: { label: "화", tactic: "생각을 밖으로 표현하고 반응을 확인하는 방식" },
    to: { label: "토", tactic: "루틴·기록·저장으로 생활에 굳히는 방식" },
    geum: { label: "금", tactic: "기준을 숫자로 세우고 불필요한 선택을 잘라내는 방식" },
    su: { label: "수", tactic: "정보와 여백을 확보한 뒤 유연하게 판단하는 방식" },
  };
  const yong = yongMap[yongKey] || { label: "균형", tactic: "한 가지 행동을 작게 반복해 반응을 확인하는 방식" };

  const score = Number(lowest.score);
  const scoreText = Number.isFinite(score) ? `${Math.round(score)}점` : "확인값";
  const gyeokName = structure.gyeokName || data?.gyeokguk?.name || "원국 구조";
  const status = structure.status || data?.gyeokStatus?.status || "균형 확인";

  const evidence = `
    <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10.5px] leading-relaxed text-slate-600">
      <b class="text-slate-800">왜 이 처방이 너한테 맞나</b><br>
      ${safe(strengthGuide)} ${safe(weakGuide)}<br>
      취약축은 <b>${safe(lowest.name)} ${safe(scoreText)}</b>, 앱이 잡은 보완축은 <b>${safe(yong.label)}</b>이라 생활에선 ${safe(yong.tactic)}으로 풀었어.
      <span class="text-slate-400">(${safe(gyeokName)} · ${safe(status)})</span>
    </div>`;

  return {
    badge: `${concernLabel} 실전 처방`,
    title: pattern.title,
    desc: `
      <div class="space-y-2">
        <div class="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
          <b class="text-amber-800">오늘 바로</b><br>
          ${safe(pattern.now)}
        </div>
        <div class="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
          <b class="text-slate-900">7일 규칙</b><br>
          ${safe(pattern.week)}
        </div>
        <div class="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5">
          <b class="text-rose-700">금지선</b><br>
          ${safe(pattern.stop)}
        </div>
        <div class="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
          <b class="text-emerald-800">성공 체크</b><br>
          ${safe(pattern.check)}
        </div>
      </div>
      ${evidence}
    `,
    checklist: pattern.rule,
  };
}

'''

s = replace_once(s, marker, function_code + marker, "insert NOTE4 builder")

note3_call = '''const noteThree = buildNoteThreeBlindSpot(
  data,
  concernKey,
  concernLabel,
  isT,
);'''
note4_call = note3_call + '''

const noteFour = buildNoteFourPrescription(
  data,
  concernKey,
  concernLabel,
  isT,
);'''
s = replace_once(s, note3_call, note4_call, "wire NOTE4 call")

old_note4 = '''          {
            themeNum: "04",
            badge: badges[3],
            title: titles[3],
            desc: `<b>${act1.t || ""}</b><br>${act1.d || ""}`,
            checklist: isT
              ? "완벽하게 준비될 때까지 미루지 말고 오늘 바로 한 단계 실행하기"
              : "무리해서 한 번에 바꾸려 하지 말고 가능한 것부터 하나씩 시작하기",
          },'''
new_note4 = '''          {
            themeNum: "04",
            badge: noteFour.badge,
            title: noteFour.title,
            desc: noteFour.desc,
            checklist: noteFour.checklist,
          },'''
s = replace_once(s, old_note4, new_note4, "replace NOTE4 card")
p.write_text(s, encoding="utf-8")


# -----------------------------------------------------------------------------
# browser regression: NOTE4 direct + integration + personalization audit
# -----------------------------------------------------------------------------
tp = Path("tests/pre_note3_browser_regression_v4.cjs")
t = tp.read_text(encoding="utf-8")

t = replace_once(
    t,
    "    typeof buildNoteThreeBlindSpot === 'function' &&\n    typeof analyzeDayMasterStrengthV2 === 'function',",
    "    typeof buildNoteThreeBlindSpot === 'function' &&\n    typeof buildNoteFourPrescription === 'function' &&\n    typeof analyzeDayMasterStrengthV2 === 'function',",
    "NOTE4 load guard",
)

close_anchor = "    await page.close();\n  }\n\n  // B. Explicitly find a 中和 chart and ensure NOTE 1/2 no longer treat it as 신약."
if t.count(close_anchor) != 1:
    raise SystemExit(f"NOTE4 audit anchor count={t.count(close_anchor)}")

audit_code = r'''    const note4Audit = await page.evaluate(() => {
      const labels = { money:'재물·돈복', career:'학업·커리어', love:'연애·썸', path:'진로·미래', people:'인간관계', mental:'번아웃·멘탈' };
      const base = calculateAccurateManse(1998,2,21,'03:10','male');
      const other = calculateAccurateManse(2001,5,6,'14:30','female');
      const out = [];
      for (const key of Object.keys(labels)) {
        for (const mode of ['F','T']) {
          const data = { ...base, concernKey:key };
          const n = buildNoteFourPrescription(data, key, labels[key], mode === 'T');
          const integrated = generateConcernNotes(data, mode)[3];
          out.push({
            key, mode,
            title:n.title, badge:n.badge, desc:n.desc, checklist:n.checklist,
            integratedTitle: integrated?.title || '',
            integratedDesc: integrated?.desc || '',
          });
        }
      }
      const a = buildNoteFourPrescription({ ...base, concernKey:'career' }, 'career', labels.career, true);
      const b = buildNoteFourPrescription({ ...other, concernKey:'career' }, 'career', labels.career, true);
      return { out, personalized: a.desc !== b.desc, a:a.desc, b:b.desc };
    });
    assert(note4Audit.out.length === 12, `NOTE4 audit count ${note4Audit.out.length}`);
    assert(new Set(note4Audit.out.map(x => x.title)).size === 12, 'NOTE4 titles are not concern/mode specific');
    for (const n of note4Audit.out) {
      assert(!!n.title && !!n.badge && !!n.desc && !!n.checklist, `NOTE4 empty field ${n.key}/${n.mode}`);
      assert(n.desc.includes('오늘 바로'), `NOTE4 immediate action missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('7일 규칙'), `NOTE4 weekly rule missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('금지선'), `NOTE4 guardrail missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('성공 체크'), `NOTE4 success metric missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('왜 이 처방이 너한테 맞나'), `NOTE4 personalization evidence missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('취약축은'), `NOTE4 weak-axis evidence missing ${n.key}/${n.mode}`);
      assert(n.desc.includes('보완축은'), `NOTE4 balance-axis evidence missing ${n.key}/${n.mode}`);
      assert(!/(undefined|NaN|null)/.test(`${n.title}${n.badge}${n.desc}${n.checklist}`), `NOTE4 bad token ${n.key}/${n.mode}`);
      assert(n.integratedTitle === n.title && n.integratedDesc === n.desc, `NOTE4 integration mismatch ${n.key}/${n.mode}`);
    }
    for (const key of ['money','career','love','path','people','mental']) {
      const f = note4Audit.out.find(x => x.key===key && x.mode==='F');
      const tt = note4Audit.out.find(x => x.key===key && x.mode==='T');
      assert(f.desc !== tt.desc, `NOTE4 F/T collapsed ${key}`);
    }
    assert(note4Audit.personalized, 'NOTE4 does not change evidence across different charts');
    console.log('NOTE4_AUDIT_PASS', JSON.stringify(note4Audit.out.map(x => ({key:x.key,mode:x.mode,title:x.title}))));

'''

t = t.replace(close_anchor, audit_code + close_anchor, 1)
tp.write_text(t, encoding="utf-8")
print("NOTE4_PATCH_READY")
