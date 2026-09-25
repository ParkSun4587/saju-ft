// 사주 원국에서 바로 계산되는 보조 신호: 60일주 성향, 일간의 12운성, 신살, 공망, 원진.
// 모두 정해진 표로만 계산한다(추정·AI 없음). NOTE는 이 값을 "맞지?" 장면과 근거로만 쓴다.
(function (global) {
  "use strict";

  const VERSION = "1.0.0";
  const GANS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const ZHIS = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const GAN_KR = {甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계"};
  const ZHI_KR = {子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해"};
  const POSITIONS = ["year","month","day","hour"];
  const POS_KR = {year:"년주",month:"월주",day:"일주",hour:"시주"};
  // 자리마다 현실에서 떠올리는 사람·영역.
  const POS_PEOPLE = {
    year:"집안 어른·윗사람",
    month:"부모님·직장",
    day:"배우자·가장 가까운 사람",
    hour:"자녀·후배·아랫사람",
  };

  // 60일주: 한 줄 이름 + "맞지?" 장면. 일주론에서 널리 쓰는 성향을 일상 장면으로 옮겼다.
  const ILJU = {
    甲子:["생각 깊은 우두머리","겉으론 차분한데 한번 정한 방향은 누가 뭐래도 밀고 가지? 머릿속으로 먼저 다 그려놓고 움직여."],
    甲寅:["혼자서도 숲이 되는 사람","남 밑에서 시키는 대로만 하면 답답하지? 내 판단으로 시작해서 끝까지 끌고 가야 직성이 풀려."],
    甲辰:["판을 크게 그리는 사람","일을 벌이는 크기가 남들보다 크지? 자잘한 일에 매이면 금방 흥미가 떨어져."],
    甲午:["말로 사람을 움직이는 사람","하고 싶은 말은 결국 하고 마는 편이지? 솔직한 게 매력인데, 가끔 생각보다 말이 먼저 나가."],
    甲申:["몰아붙일수록 단단해지는 사람","편하게 두면 오히려 늘어지고, 누가 기준을 세게 걸어야 실력이 나오지?"],
    甲戌:["뚝심으로 버티는 사람","한번 맡은 건 끝까지 책임지려 하지? 대신 내 방식을 건드리면 은근히 고집이 세."],
    乙丑:["조용히 끈질긴 사람","티 안 내고 꾸준히 해서 결국 해내지? 느려 보여도 한번 자리 잡으면 잘 안 흔들려."],
    乙卯:["부드러운데 꺾이지 않는 사람","겉으론 맞춰주는 것 같아도 속으론 결국 내 뜻대로 가지? 사람 사이 줄타기를 잘해."],
    乙巳:["분위기를 읽는 센스파","눈치가 빠르고 말 한마디로 분위기를 바꾸지? 대신 지루한 건 오래 못 참아."],
    乙未:["순해 보여도 속이 단단한 사람","순해 보이는데 막상 부딪히면 쉽게 안 물러서지? 내 사람한텐 끝까지 챙겨."],
    乙酉:["디테일에 예민한 사람","남들이 못 보는 작은 흠이 자꾸 눈에 걸리지? 기준이 높아서 스스로한테도 엄격해."],
    乙亥:["다정한 공감형","남 얘기 들어주다 보면 내 일처럼 마음이 쓰이지? 부탁을 딱 잘라 거절하는 게 어려워."],
    丙子:["밝은데 속 깊은 사람","사람들 앞에선 밝은데 혼자 있을 땐 생각이 많지? 겉과 속의 온도가 꽤 달라."],
    丙寅:["시작의 불꽃","새로운 걸 시작할 때 제일 신나지? 추진력은 최고인데 마무리 단계에서 흥미가 식어."],
    丙辰:["무대 체질","사람들 앞에 서면 오히려 살아나지? 인정받을 때 힘이 두 배로 나."],
    丙午:["한여름 태양 같은 사람","좋고 싫은 게 얼굴에 다 드러나지? 한번 불붙으면 누구도 못 말려."],
    丙申:["바빠야 사는 사람","가만히 있으면 오히려 불안하지? 일도 사람도 여기저기 벌려놓는 편이야."],
    丙戌:["의리로 사는 사람","내 사람이라고 정하면 끝까지 챙기지? 대신 한번 등 돌리면 다시 안 봐."],
    丁丑:["조용한 장인","말수는 적어도 맡은 건 확실히 하지? 속으로 삭이는 게 많아서 가끔 한 번에 터져."],
    丁卯:["감성이 섬세한 사람","말투 하나, 분위기 하나에 마음이 금방 흔들리지? 좋아하는 건 누구보다 깊게 빠져."],
    丁巳:["은근히 승부욕 강한 사람","겉으론 여유로운 척해도 지는 건 정말 싫지? 목표가 생기면 집요해져."],
    丁未:["따뜻한데 고집 있는 사람","남 챙기는 건 잘하는데 내 방식은 잘 안 바꾸지? 서운한 건 오래 기억해."],
    丁酉:["촉이 좋은 사람","사람 볼 때 첫 느낌이 거의 맞지? 예민해서 피곤한 만큼 센스가 좋아."],
    丁亥:["배려가 먼저인 사람","상대 기분 살피느라 내 얘기는 자꾸 뒤로 미루지? 속으론 인정받고 싶은 마음이 커."],
    戊子:["무던한데 현실적인 사람","겉으론 무던한데 돈 계산은 확실하지? 불안한 것보다 안정적인 게 제일 좋아."],
    戊寅:["책임질 때 힘이 나는 사람","책임지는 자리에 서면 오히려 힘이 나지? 대신 남한테 약한 모습 보이는 건 싫어."],
    戊辰:["품이 큰 사람","욕심도 크고 품도 크지? 한번 믿으면 크게 밀어주는데, 배신엔 냉정해."],
    戊午:["뜨겁고 고집 센 사람","한번 꽂히면 끝까지 가지? 남 말보다 내 확신이 먼저야."],
    戊申:["수완 좋은 해결사","막히면 어떻게든 방법을 찾아내지? 이것저것 손대는 재주가 많아."],
    戊戌:["묵직한 원칙주의자","쉽게 안 움직이지만 한번 움직이면 끝을 보지? 혼자 있는 시간이 꼭 있어야 해."],
    己丑:["차곡차곡 쌓는 사람","티 안 나게 조금씩 쌓는 게 편하지? 남들이 몰라줘도 묵묵히 해."],
    己卯:["예민한 완벽주의자","사소한 말에도 마음이 쓰이지? 겉으론 괜찮은 척하고 속으로 오래 곱씹어."],
    己巳:["생각 많은 전략가","머릿속으론 이미 몇 수 앞을 보고 있지? 조용해 보여도 계산이 빨라."],
    己未:["고집 있는 살림꾼","내 영역은 내가 챙겨야 마음이 놓이지? 한번 정한 건 잘 안 바꿔."],
    己酉:["야무진 실속파","말보다 결과로 보여주는 게 편하지? 손끝이 야무져서 작은 것도 잘 다듬어."],
    己亥:["순한데 계산 빠른 사람","겉으론 부드럽게 맞춰주는데, 손해 볼 일은 속으로 빠르게 알아채지? 내 사람·내 살림은 확실히 챙겨."],
    庚子:["냉철한 해결사","감정보다 해결이 먼저지? 말은 차가워 보여도 도와줄 땐 확실하게 도와."],
    庚寅:["밀고 나가는 개척자","하고 싶은 건 일단 해봐야 직성이 풀리지? 가만히 기다리는 걸 제일 못 해."],
    庚辰:["존재감이 큰 사람","어디 가도 존재감이 크지? 남 밑에서 시키는 대로만 하는 건 체질에 안 맞아."],
    庚午:["책임감 강한 원칙파","맡은 건 무조건 해내야 하지? 대충 넘어가는 사람을 보면 답답해."],
    庚申:["칼 같은 사람","싫은 건 싫다고 딱 잘라 말하지? 결정이 빠르고 뒤끝은 없는 편이야."],
    庚戌:["의리파 승부사","한번 붙으면 끝장을 보지? 내 편이면 끝까지 지켜줘."],
    辛丑:["자존심 센 버팀형","겉으론 조용한데 자존심이 세지? 인정받을 때까지 버티는 힘이 있어."],
    辛卯:["예리한 감각파","남들이 놓친 걸 콕 집어내지? 말이 날카로워서 가끔 오해를 사."],
    辛巳:["품위를 지키는 사람","대충 한 건 내 이름 걸고 못 내놓지? 남들 시선도 은근히 신경 써."],
    辛未:["호불호 확실한 섬세파","마음에 드는 건 확실하고 아니면 아예 안 쓰지? 참다가 한 번에 정리해."],
    辛酉:["빛나야 하는 완벽주의자","잘하는 걸로 인정받는 게 제일 중요하지? 실수하면 스스로를 오래 괴롭혀."],
    辛亥:["머릿속이 늘 바쁜 사람","감정 표현은 아끼는데 머릿속은 늘 바쁘지? 혼자 정리하는 시간이 꼭 필요해."],
    壬子:["속 깊은 바다 같은 사람","속을 잘 안 보여주지? 한번 마음먹으면 누구보다 크게 움직여."],
    壬寅:["아이디어가 샘솟는 사람","생각이 빠르고 말로 풀어내는 걸 잘하지? 뭔가 떠오르면 바로 해보고 싶어."],
    壬辰:["크게 움직이는 야망가","크게 생각하고 크게 움직이지? 작은 판에 있으면 답답해해."],
    壬午:["현실 감각 좋은 사람","돈이나 조건 얘기가 나오면 머리가 빨리 돌지? 사람 관계도 속으론 계산이 서 있어."],
    壬申:["머리 좋은 자유인","배우는 건 빠른데 틀에 갇히는 건 싫지? 여기저기 다니며 경험을 모아."],
    壬戌:["속을 알 수 없는 사람","겉으론 여유로운데 속으로 다 계산하고 있지? 한번 화나면 크게 터져."],
    癸丑:["조용히 버티는 사람","힘든 티를 잘 안 내지? 혼자 참다가 한계에 와서야 말해."],
    癸卯:["순수한 감성파","좋아하는 게 표정에 다 드러나지? 사람을 잘 믿어서 가끔 상처받아."],
    癸巳:["생각을 결과로 바꾸는 사람","생각한 걸 돈이나 결과로 연결하는 감이 있지? 겉보기보다 욕심이 있어."],
    癸未:["참을성 많은 사람","남한테 맞춰주다가 속으로 지치지? 한계가 오면 조용히 멀어져."],
    癸酉:["깔끔한 원칙형","정리된 게 좋고 애매한 건 불편하지? 배우고 익히는 걸 좋아해."],
    癸亥:["감이 좋은 몽상가","직감이 잘 맞고 상상력이 풍부하지? 기분 따라 에너지가 크게 오르내려."],
  };

  // 일간 기준 12운성(장생 자리와 방향). 양간은 순행, 음간은 역행.
  const STAGES = ["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];
  const STAGE_START = {甲:"亥",丙:"寅",戊:"寅",庚:"巳",壬:"申",乙:"午",丁:"酉",己:"酉",辛:"子",癸:"卯"};
  const STAGE_SCENE = {
    장생:"새로운 걸 배우고 시작할 때 힘이 제일 잘 붙는 편이야.",
    목욕:"기분과 감정이 표정에 잘 드러나고, 꾸미고 표현하는 감각이 있어.",
    관대:"자존심이 세서 인정받는 자리에서 확 살아나.",
    건록:"남한테 기대기보다 내 힘으로 서야 마음이 편해.",
    제왕:"주도권을 쥐고 있어야 편하고, 누가 시키면 오히려 힘이 빠져.",
    쇠:"무리해서 앞에 나서기보다 경험으로 판단하는 노련함이 있어.",
    병:"남 사정을 잘 봐주고 공감을 많이 해서 정작 내 몫을 놓치기 쉬워.",
    사:"한 가지에 꽂히면 깊게 파고들어서 끝을 봐.",
    묘:"모으고 쌓아두는 데 강해서, 돈이든 물건이든 생각이든 쉽게 안 버려.",
    절:"끊을 땐 확 끊고 새로 시작하는 결단이 빨라.",
    태:"하고 싶은 게 많고 가능성을 여러 갈래로 열어두는 편이야.",
    양:"처음엔 천천히 가도 보살핌을 받으면서 점점 크게 자라는 대기만성형이야.",
  };

  // 신살 표. 삼합 그룹 기준(도화·역마·화개)은 년지·일지를 기준으로 다른 자리에서 찾는다.
  const TRIAD = {寅:"fire",午:"fire",戌:"fire",申:"water",子:"water",辰:"water",巳:"metal",酉:"metal",丑:"metal",亥:"wood",卯:"wood",未:"wood"};
  const DOHWA = {fire:"卯",water:"酉",metal:"午",wood:"子"};
  const YEOKMA = {fire:"申",water:"寅",metal:"亥",wood:"巳"};
  const HWAGAE = {fire:"戌",water:"辰",metal:"丑",wood:"未"};
  const CHEONEUL = {甲:["丑","未"],戊:["丑","未"],庚:["丑","未"],乙:["子","申"],己:["子","申"],丙:["亥","酉"],丁:["亥","酉"],辛:["寅","午"],壬:["巳","卯"],癸:["巳","卯"]};
  const MUNCHANG = {甲:"巳",乙:"午",丙:"申",丁:"酉",戊:"申",己:"酉",庚:"亥",辛:"子",壬:"寅",癸:"卯"};
  const HONGYEOM = {甲:"午",乙:"午",丙:"寅",丁:"未",戊:"辰",己:"辰",庚:"戌",辛:"酉",壬:"子",癸:"申"};
  const YANGIN = {甲:"卯",丙:"午",戊:"午",庚:"酉",壬:"子"};
  const GOEGANG = ["庚辰","庚戌","壬辰","壬戌","戊戌"];
  const BAEKHO = ["甲辰","乙未","丙戌","丁丑","戊辰","壬戌","癸丑"];
  const WONJIN = [["子","未"],["丑","午"],["寅","酉"],["卯","申"],["辰","亥"],["巳","戌"]];

  // 신살 이름, 쉬운 뜻, "맞지?" 장면, 연애·돈·일에서의 결.
  const SINSAL_INFO = {
    도화:{plain:"사람을 끄는 매력",scene:"가만히 있어도 눈에 띄거나 호감을 사는 편이지? 사람들이 먼저 말을 거는 일이 많아.",tone:"good"},
    역마:{plain:"움직일수록 트이는 기운",scene:"한 곳에 오래 있으면 답답하지? 이동·출장·여행·이사처럼 움직일 때 일이 잘 풀려.",tone:"good"},
    화개:{plain:"혼자 깊어지는 기운",scene:"사람들이랑 잘 놀아도 결국 혼자 있는 시간이 있어야 충전되지? 공부·예술·종교처럼 혼자 깊게 파는 것에 끌려.",tone:"neutral"},
    천을귀인:{plain:"도와주는 사람 복",scene:"힘들 때 신기하게 누군가 손을 내밀어준 적 있지? 막판에 도와주는 사람이 나타나는 사주야.",tone:"good"},
    문창귀인:{plain:"글·공부 감각",scene:"정리하고 설명하는 걸 잘해서, 네가 말하면 사람들이 이해를 잘하지?",tone:"good"},
    홍염:{plain:"분위기 있는 매력",scene:"설명하기 어려운 분위기 있는 매력이 있어서, 이성한테 은근히 인기가 있는 편이야.",tone:"good"},
    양인:{plain:"한번 붙으면 안 지는 기운",scene:"평소엔 참아도 한번 화나면 누구도 못 말리지? 승부처에선 오히려 강해.",tone:"strong"},
    괴강:{plain:"기가 센 결단력",scene:"어중간한 걸 못 참고 결정이 빠르지? 기가 세다는 말을 들어본 적 있을 거야.",tone:"strong"},
    백호:{plain:"한번 터지면 크게 터지는 기운",scene:"일이 한번 터지면 크게 터지는 편이라, 급하게 몰아붙일 때 다툼·사고를 특히 조심해야 해.",tone:"caution"},
  };

  function zhiIndex(z){ return ZHIS.indexOf(z); }
  function ganIndex(g){ return GANS.indexOf(g); }
  function ganzhiKr(g,z){ return (GAN_KR[g]||"")+(ZHI_KR[z]||""); }

  function twelveStage(gan, zhi){
    const start = STAGE_START[gan];
    if (!start || zhiIndex(zhi) < 0) return "";
    const s = zhiIndex(start), z = zhiIndex(zhi);
    const yang = ganIndex(gan) % 2 === 0;
    const step = yang ? (z - s + 12) % 12 : (s - z + 12) % 12;
    return STAGES[step];
  }

  function gongmangOf(dayGan, dayZhi){
    const g = ganIndex(dayGan), z = zhiIndex(dayZhi);
    if (g < 0 || z < 0) return [];
    const startZhi = (z - g + 12) % 12;
    return [ZHIS[(startZhi + 10) % 12], ZHIS[(startZhi + 11) % 12]];
  }

  function pillarsFrom(p){
    const out = {};
    POSITIONS.forEach((pos) => {
      const x = p?.[pos];
      if (x && GAN_KR[x.gan] && ZHI_KR[x.zhi]) out[pos] = { gan:x.gan, zhi:x.zhi };
    });
    return out;
  }

  function computeSajuSignals(rawPillars){
    const pillars = pillarsFrom(rawPillars || {});
    const day = pillars.day;
    if (!day) return null;
    const dayGan = day.gan, dayZhi = day.zhi;
    const present = POSITIONS.filter((pos) => pillars[pos]);
    const found = [];
    const add = (name, positions, basis) => {
      if (!positions.length) return;
      const prev = found.find((x) => x.name === name);
      if (prev) { positions.forEach((p) => { if (!prev.positions.includes(p)) prev.positions.push(p); }); return; }
      found.push({ name, positions:[...positions], basis, ...SINSAL_INFO[name] });
    };

    ["day","year"].forEach((basisPos) => {
      const basis = pillars[basisPos];
      if (!basis) return;
      const group = TRIAD[basis.zhi];
      const others = present.filter((pos) => pos !== basisPos);
      add("도화", others.filter((pos) => pillars[pos].zhi === DOHWA[group]), basisPos);
      add("역마", others.filter((pos) => pillars[pos].zhi === YEOKMA[group]), basisPos);
      add("화개", others.filter((pos) => pillars[pos].zhi === HWAGAE[group]), basisPos);
    });
    add("천을귀인", present.filter((pos) => (CHEONEUL[dayGan] || []).includes(pillars[pos].zhi)), "dayGan");
    add("문창귀인", present.filter((pos) => pillars[pos].zhi === MUNCHANG[dayGan]), "dayGan");
    add("홍염", present.filter((pos) => pillars[pos].zhi === HONGYEOM[dayGan]), "dayGan");
    if (YANGIN[dayGan]) add("양인", present.filter((pos) => pillars[pos].zhi === YANGIN[dayGan]), "dayGan");
    if (GOEGANG.includes(dayGan + dayZhi)) add("괴강", ["day"], "dayPillar");
    add("백호", present.filter((pos) => BAEKHO.includes(pillars[pos].gan + pillars[pos].zhi)), "pillar");

    const gongmang = gongmangOf(dayGan, dayZhi);
    const gongmangPositions = present.filter((pos) => pos !== "day" && gongmang.includes(pillars[pos].zhi));

    const wonjin = [];
    present.filter((pos) => pos !== "day").forEach((pos) => {
      const z = pillars[pos].zhi;
      if (WONJIN.some(([a,b]) => (a === dayZhi && b === z) || (b === dayZhi && a === z))) wonjin.push(pos);
    });

    const stages = {};
    present.forEach((pos) => { stages[pos] = twelveStage(dayGan, pillars[pos].zhi); });
    const dayStage = stages.day || "";
    const key = dayGan + dayZhi;
    const ilju = ILJU[key] || null;

    return {
      version:VERSION,
      ilju:{
        key,
        name:ganzhiKr(dayGan, dayZhi) + "일주",
        tag:ilju ? ilju[0] : "",
        scene:ilju ? ilju[1] : "",
      },
      dayStage,
      dayStageScene:STAGE_SCENE[dayStage] || "",
      stages,
      sinsal:found,
      gongmang:{ branches:gongmang, branchesKr:gongmang.map((z) => ZHI_KR[z]), positions:gongmangPositions },
      wonjin:{ positions:wonjin },
      hourKnown:!!pillars.hour,
    };
  }

  global.computeSajuSignalsV1 = computeSajuSignals;
  global.__SAJU_SIGNALS_V1__ = {
    version:VERSION,
    compute:computeSajuSignals,
    twelveStage,
    gongmangOf,
    iljuTable:ILJU,
    sinsalInfo:SINSAL_INFO,
    positionPeople:POS_PEOPLE,
    positionName:POS_KR,
  };
})(globalThis);
