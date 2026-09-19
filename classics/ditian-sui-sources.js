(function (global) {
  "use strict";

  // 적천수 근거층. NOTE가 원문을 직접 읽지 않고, 아래 원칙 ID를 규칙층에서 참조한다.
  const SOURCES = {
    DTS_FORCE_001: {
      work: "적천수",
      section: "쇠왕",
      principle: "강약은 월령 하나만 보지 않고 월령·통근·천간 부조·지지 세력·설재관의 전체 손익을 함께 본다.",
      sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE",
    },
    DTS_FORCE_002: {
      work: "적천수",
      section: "쇠왕",
      principle: "강한 쪽은 설하거나 제어할 길을 찾고, 약한 쪽은 생조를 찾되 극단 구조는 일반 억부 규칙에 억지로 넣지 않는다.",
      sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE",
    },
    DTS_ROOT_004: {
      work: "적천수",
      section: "쇠왕",
      principle: "득령 여부와 별개로 다른 기둥의 뿌리와 부조가 실제로 일간을 살리거나 약화시킬 수 있으므로 통근의 위치와 세기를 보존한다.",
      sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE",
    },
    DTS_FLOW_007: {
      work: "적천수",
      section: "통천론·쇠왕",
      principle: "오행은 고정 개수보다 흐름과 진퇴를 본다. 어느 힘이 주도하고 어디에서 막히는지를 연결해서 판단한다.",
      sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93/01",
    },
    DTS_BRIDGE_012: {
      work: "적천수",
      section: "통관",
      principle: "서로 직접 제어하는 강한 두 힘 사이에 생의 연결고리가 성립하면 충돌을 완화하는 통관으로 본다.",
      sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE",
    },
    DTS_SPECIAL_020: {
      work: "적천수",
      section: "종세·전왕 관련",
      principle: "극단적으로 한쪽 세력이 압도하는 구조는 일반 신강·신약과 별도 검토가 필요하다.",
      sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE",
      implementation: "candidate-only",
      note: "현재 엔진은 종격·가종·전왕을 확정하지 않고 별도 미구현 후보로만 표시한다.",
    },
    DTS_COMBINE_021: {
      work: "적천수",
      section: "배합·기세",
      principle: "합이 존재한다고 곧바로 오행이 변했다고 보지 않고 실제 화기 성립 조건을 별도로 확인해야 한다.",
      implementation: "detect-only",
      note: "현재 엔진은 천간합 존재만 감지하고 합화 성립은 미구현으로 남긴다.",
    },
  };

  global.__DITIAN_SUI_SOURCES__ = {
    version: "1.0.0",
    sources: SOURCES,
  };
})(globalThis);
