/**
 * 付费套餐种子数据
 */
export const packageSeeds = [
  {
    id: 'pkg_small',
    name: '小确幸包',
    code: 'small_happy',
    price: 690,
    single_count: 5,
    three_count: 2,
    description: '入门体验，适合偶尔想抽牌看看的你',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'pkg_warm',
    name: '知心包',
    code: 'warm_heart',
    price: 1990,
    single_count: 15,
    three_count: 8,
    description: '超值推荐，适合每周想获得指引的你',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'pkg_deep',
    name: '深度包',
    code: 'deep_explore',
    price: 3990,
    single_count: 40,
    three_count: 20,
    description: '高频专属，适合深度探索人生的你',
    is_active: true,
    sort_order: 3,
  },
];
