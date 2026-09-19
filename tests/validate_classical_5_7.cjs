const path = require('path');
require(path.resolve('classical-engine-v2.js'));

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const E = global.__CLASSICAL_ENGINE_V2__;
assert(E && E.version === '2.1.0', 'classical engine v2.1 not loaded');

function P(year, month, day, hour) { return { year, month, day, ...(hour ? {hour} : {}) }; }

// ⑤ 신강·중화·신약: 월령과 통근을 실제로 반영하는지 극단 사례로 고정한다.
const strong = P(
  {gan:'癸',zhi:'亥'}, {gan:'壬',zhi:'子'}, {gan:'壬',zhi:'子'}, {gan:'庚',zhi:'申'}
);
const weak = P(
  {gan:'庚',zhi:'申'}, {gan:'庚',zhi:'酉'}, {gan:'甲',zhi:'午'}, {gan:'丙',zhi:'午'}
);
const s1 = global.analyzeDayMasterStrengthV2({pillars: strong});
const s2 = global.analyzeDayMasterStrengthV2({pillars: weak});
assert(s1.verdict === '신강', `strong chart expected 신강 got ${JSON.stringify(s1)}`);
assert(s2.verdict === '신약', `weak chart expected 신약 got ${JSON.stringify(s2)}`);
assert(s1.supportRatio > s2.supportRatio, 'support ratio ordering broken');
assert(Array.isArray(s1.evidence) && s1.evidence.length >= 3, 'strength evidence missing');

// raw visible count와 해석용 세력값은 서로 다른 축이어야 한다.
const profiles = global.getElementProfilesV2(strong);
assert(profiles.raw && profiles.influence, 'element profiles missing');
assert(Object.values(profiles.raw).reduce((a,b)=>a+b,0) === 8, 'raw visible element count should be 8');
assert(profiles.influence.su > profiles.influence.to, 'month/hidden influence weighting not reflected');

// ⑦ 격국: 건록·양인·왕지 정관격 등 월령 중심 분기가 살아 있는지 확인.
const geonrok = global.determineGyeokgukFromPillarsV2(P(
  {gan:'丙',zhi:'子'}, {gan:'丙',zhi:'寅'}, {gan:'甲',zhi:'辰'}, {gan:'戊',zhi:'午'}
), {});
assert(geonrok.name === '건록격', `甲寅 month expected 건록격 got ${geonrok.name}`);
const yangin = global.determineGyeokgukFromPillarsV2(P(
  {gan:'丁',zhi:'亥'}, {gan:'辛',zhi:'酉'}, {gan:'庚',zhi:'辰'}, {gan:'丙',zhi:'子'}
), {});
assert(yangin.name === '양인격', `庚酉 month expected 양인격 got ${yangin.name}`);
const officer = global.determineGyeokgukFromPillarsV2(P(
  {gan:'丙',zhi:'辰'}, {gan:'辛',zhi:'酉'}, {gan:'甲',zhi:'子'}, {gan:'戊',zhi:'午'}
), {});
assert(officer.name === '정관격', `甲日 酉月 expected 정관격 got ${officer.name}`);
assert(officer.branchType === '왕지', '酉 month should be 왕지');

const statusGood = global.evaluateGyeokStatusV2(
  officer,
  {year:{gan:'편재'},month:{gan:'정관'},hour:{gan:'정인'}}
);
assert(statusGood.status === '성격', `정관격 with 財印 expected 성격 got ${JSON.stringify(statusGood)}`);
const statusBroken = global.evaluateGyeokStatusV2(
  officer,
  {year:{gan:'상관'},month:{gan:'비견'},hour:{gan:'겁재'}}
);
assert(statusBroken.status === '파격', `정관격 with 傷官 expected 파격 got ${JSON.stringify(statusBroken)}`);

// ⑥ 용·희·기신: 궁통보감/조후를 제외하고 억부+통관+격국 구조가 합성되는지 검증.
const yStrong = global.selectYongshinV2({
  pillars: strong,
  strength: s1,
  elementProfiles: global.getElementProfilesV2(strong),
  gyeokguk: global.determineGyeokgukFromPillarsV2(strong, {}),
});
assert(['mok','hwa','to','geum','su'].includes(yStrong.primary), 'invalid yongshin element');
assert(yStrong.primary !== 'su', `very strong water chart should not select self water: ${JSON.stringify(yStrong)}`);
assert(yStrong.detail[yStrong.primary].length > 0, 'yongshin evidence missing');
assert(yStrong.method.includes('억부') && yStrong.method.includes('통관') && yStrong.method.includes('격국'), 'yongshin method layers missing');
assert(!yStrong.method.includes('한난조습') && !('climateReasons' in yStrong), 'Qiongtong/climate layer must be removed');

// 다양한 원국 조합에서 NaN/예외 없이 일관된 객체를 반환해야 한다.
const gans='甲乙丙丁戊己庚辛壬癸';
const zhis='子丑寅卯辰巳午未申酉戌亥';
let fuzz=0;
for (let i=0;i<1200;i++) {
  const pickGan=n=>gans[(i*7+n*3)%10];
  const pickZhi=n=>zhis[(i*5+n*7)%12];
  const p=P(
    {gan:pickGan(0),zhi:pickZhi(0)},
    {gan:pickGan(1),zhi:pickZhi(1)},
    {gan:pickGan(2),zhi:pickZhi(2)},
    {gan:pickGan(3),zhi:pickZhi(3)},
  );
  const st=global.analyzeDayMasterStrengthV2({pillars:p});
  const ep=global.getElementProfilesV2(p);
  const gg=global.determineGyeokgukFromPillarsV2(p,{});
  const ys=global.selectYongshinV2({pillars:p,strength:st,elementProfiles:ep,gyeokguk:gg});
  const cl=global.buildClassicalLayersV2({pillars:p,strength:st,elementProfiles:ep,gyeokguk:gg,yongshinDetail:ys,calendarMeta:{}});
  assert(Number.isFinite(st.supportRatio), `NaN strength case ${i}`);
  assert(Object.values(ys.scores).every(Number.isFinite), `NaN yongshin case ${i}`);
  assert(gg.name && cl.japyeong && cl.jeokcheon && cl.yongshin && !cl.qiongtong, `classical layer regression case ${i}`);
  fuzz++;
}

console.log(JSON.stringify({
  strengthCases:2,
  gyeokCases:3,
  gyeokStatusCases:2,
  yongshinCases:1,
  fuzzCases:fuzz,
  status:'PASS'
}, null, 2));
