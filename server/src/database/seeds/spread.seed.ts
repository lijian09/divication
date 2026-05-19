/**
 * 牌阵种子数据
 */
export const spreadSeeds = {
  spreads: [
    {
      id: 'spread_single',
      name: '单牌阵',
      type: 'single',
      description: '抽取一张牌，获取简洁直接的指引。适合日常快速占卜，或针对具体问题寻求一个明确的答案。',
      position_count: 1,
      is_active: true,
      sort_order: 1,
    },
    {
      id: 'spread_three',
      name: '三牌阵',
      type: 'three',
      description: '抽取三张牌，分别代表过去、现在和未来。适合深入了解问题的发展脉络，提供更全面的视角。',
      position_count: 3,
      is_active: true,
      sort_order: 2,
    },
  ],
  positions: [
    // 单牌阵位置
    {
      id: 'pos_single_1',
      spread_id: 'spread_single',
      position_index: 1,
      position_name: '核心主题',
      description: '这张牌代表你问题的核心指引和当前的能量状态',
    },
    // 三牌阵位置
    {
      id: 'pos_three_1',
      spread_id: 'spread_three',
      position_index: 1,
      position_name: '过去',
      description: '这张牌代表影响当前 situation 的过去因素',
    },
    {
      id: 'pos_three_2',
      spread_id: 'spread_three',
      position_index: 2,
      position_name: '现在',
      description: '这张牌代表你当前的状态和面临的挑战',
    },
    {
      id: 'pos_three_3',
      spread_id: 'spread_three',
      position_index: 3,
      position_name: '未来',
      description: '这张牌代表事情可能的发展方向和结果',
    },
  ],
};
