(function (global) {
  "use strict";

  // 자평진전 근거층. 원문·주석을 NOTE에서 즉흥 해석하지 않고 규칙 ID가 이 근거를 참조한다.
  const SOURCES = {
    ZZ_MONTH_001: {
      work: "자평진전",
      section: "용신을 논함",
      principle: "격의 중심은 월령에서 찾고 일간과 월령의 생극 관계를 기준으로 구조를 세운다.",
      sourceUrl: "https://donglishuzhai.net/chapter/3721.html",
    },
    ZZ_FLOW_002: {
      work: "자평진전",
      section: "용신을 논함",
      principle: "재·관·인·식의 순용과 살·상·겁·인의 역용을 구분하며, 같은 십신도 격의 맥락에 따라 역할이 달라진다.",
      sourceUrl: "https://donglishuzhai.net/chapter/3721.html",
    },
    ZZ_SUCCESS_010: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "격은 월령만 이름 붙이는 것으로 끝나지 않고 네 기둥의 배합을 통해 성·패·구응을 함께 본다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_POSITION_019: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "같은 십신이 있어도 어느 기둥에 투출하고 서로 직접 극하는 위치인지에 따라 성패가 달라질 수 있으므로 위치를 보존한다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_OFFICER_011: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "정관은 재·인으로 생호되는 길과 상관 등으로 손상되는 길을 구분한다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_WEALTH_012: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "재격은 식상으로 생하거나 관으로 이어지는 배합을 보고, 비겁이 재를 무너뜨리는지 함께 본다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_PRINT_013: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "인격은 관살의 생조, 인성의 과다, 재성의 손상 여부를 구조적으로 비교한다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_KILL_014: {
      work: "자평진전",
      section: "용신을 논함·성패와 구응",
      principle: "편관은 그대로 키우는 것보다 제어·전환 경로가 있는지, 재성이 압박을 더 키우는지 등을 구분한다.",
      sourceUrl: "https://donglishuzhai.net/chapter/3721.html",
    },
    ZZ_OUTPUT_015: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "식신은 재로 이어지는 길과 편인에 의해 손상되는 길을 구분한다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_HURT_016: {
      work: "자평진전",
      section: "용신을 논함·성패와 구응",
      principle: "상관은 재로 설하거나 인으로 제어하는 길을 보고, 정관과의 충돌은 별도 손상으로 본다.",
      sourceUrl: "https://donglishuzhai.net/chapter/3721.html",
    },
    ZZ_BLADE_017: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "양인은 관살의 제어가 있는지 여부를 핵심 배합으로 본다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_LUJIE_018: {
      work: "자평진전",
      section: "용신을 논함·성패와 구응",
      principle: "건록·월겁은 월령 자체를 그대로 용으로 삼지 않고 재·관·식상·살의 배합을 따로 찾는다.",
      sourceUrl: "https://donglishuzhai.net/chapter/3721.html",
    },
    ZZ_RESCUE_020: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "성중유패·패중유성은 단순 점수 평균이 아니라 무엇이 무엇을 깨고 무엇이 다시 구하는지 순서를 보존한다.",
      sourceUrl: "https://shuyuan.zhiming.life/read/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/13",
    },
    ZZ_SEQUENCE_021: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "성격을 세우는 배합, 그것을 깨뜨리는 기신, 다시 깨진 구조를 구하는 구응을 인과 순서로 판정한다.",
      sourceUrl: "https://donglishuzhai.net/chapter/3722.html",
    },
    ZZ_RELATION_022: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "관격 등에서 형·충·파·해를 살피되 충을 가장 무겁게 보고, 형·파·해는 경중을 따져 단독으로 모두 파격 처리하지 않는다.",
      sourceUrl: "https://www.8bei8.com/book/zipingzhenquanpingzhu_11.html",
    },
    ZZ_COMBINE_023: {
      work: "자평진전",
      section: "용신의 성패와 구응을 논함",
      principle: "합은 무조건 좋은 작용이 아니며, 무엇을 합해 묶는지에 따라 성중유패 또는 구응이 될 수 있다.",
      sourceUrl: "https://donglishuzhai.net/chapter/3722.html",
    },
    ZZ_CHANGE_030: {
      work: "자평진전",
      section: "용신 변화",
      principle: "합·회 등으로 월령의 실제 작동이 달라지는 경우는 별도 변화 규칙이 필요하다.",
      implementation: "not-implemented",
      note: "현재 엔진은 합화·회국으로 격 자체가 바뀌는 확정 규칙을 구현하지 않는다.",
    },
  };

  global.__ZIPING_ZHENQUAN_SOURCES__ = {
    version: "1.1.0",
    sources: SOURCES,
  };
})(globalThis);
