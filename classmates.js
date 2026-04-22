/* ============================================================
   高中模拟器 — 同学数据库
   ============================================================ */

const CLASSMATE_POOL = [
  {
    id: 'wang',
    name: '小王',
    emoji: '😄',
    trait: '活泼',
    defaultAffinity: 55,
    desc: '班里的开心果，总能在最难熬的备考期带来欢笑，和他在一起永远不会无聊，但有时会带偏你的学习计划。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '1', effect: { affinity: 12, money: -50, mental: 10, effort: -3 } },
          { text: '2', effect: { affinity: 12, money: -50, mental: 10, effort: -3 } },
          { text: '3', effect: { affinity: 12, money: -50, mental: 10, effort: -3 } },
          { text: '4', effect: { affinity: 12, money: -50, mental: 10, effort: -3 } },
          { text: '5', effect: { affinity: 12, money: -50, mental: 10, effort: -3 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '1', effect: { affinity: 10, mental: 12, health: 5, effort: -5 } },
          { text: '2', effect: { affinity: 10, mental: 12, health: 5, effort: -5 } },
          { text: '3', effect: { affinity: 10, mental: 12, health: 5, effort: -5 } },
          { text: '4', effect: { affinity: 10, mental: 12, health: 5, effort: -5 } },
          { text: '5', effect: { affinity: 10, mental: 12, health: 5, effort: -5 } },
        ],
      },
    },
  },
  {
    id: 'li_s',
    name: '小李',
    emoji: '🤓',
    trait: '认真',
    defaultAffinity: 40,
    desc: '成绩稳居全班前三，平时话不多，但愿意和你分享学习心得，和他相处起来有种莫名的踏实感。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '1', effect: { affinity: 11, money: -40, learning: 6, mental: 5 } },
          { text: '2', effect: { affinity: 11, money: -40, learning: 6, mental: 5 } },
          { text: '3', effect: { affinity: 11, money: -40, learning: 6, mental: 5 } },
          { text: '4', effect: { affinity: 11, money: -40, learning: 6, mental: 5 } },
          { text: '5', effect: { affinity: 11, money: -40, learning: 6, mental: 5 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '1', effect: { affinity: 9, learning: 10, effort: 8, mental: 3 } },
          { text: '2', effect: { affinity: 9, learning: 10, effort: 8, mental: 3 } },
          { text: '3', effect: { affinity: 9, learning: 10, effort: 8, mental: 3 } },
          { text: '4', effect: { affinity: 9, learning: 10, effort: 8, mental: 3 } },
          { text: '5', effect: { affinity: 9, learning: 10, effort: 8, mental: 3 } },
        ],
      },
    },
  },
  {
    id: 'zhao',
    name: '小赵',
    emoji: '🍜',
    trait: '吃货',
    defaultAffinity: 48,
    desc: '对学校周边每家餐馆如数家珍，号称"水衡美食地图"，热爱生活，心情永远不错。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '1', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
          { text: '2', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
          { text: '3', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
          { text: '4', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
          { text: '5', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '1', effect: { affinity: 11, mental: 10, health: -5, effort: -4 } },
          { text: '2', effect: { affinity: 11, mental: 10, health: -5, effort: -4 } },
          { text: '3', effect: { affinity: 11, mental: 10, health: -5, effort: -4 } },
          { text: '4', effect: { affinity: 11, mental: 10, health: -5, effort: -4 } },
          { text: '5', effect: { affinity: 11, mental: 10, health: -5, effort: -4 } },
        ],
      },
    },
  },
  {
    id: 'chen_s',
    name: '小陈',
    emoji: '🎭',
    trait: '搞笑',
    defaultAffinity: 50,
    desc: '班级气氛组组长，从不让课间安静，能把最无聊的课讲成段子，但认真起来居然也能考出好成绩，让人意外。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '1', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '2', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '3', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '4', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '5', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '1', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
          { text: '2', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
          { text: '3', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
          { text: '4', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
          { text: '5', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
        ],
      },
    },
  },
  {
    id: 'lin_s',
    name: '小林',
    emoji: '🎨',
    trait: '温柔',
    defaultAffinity: 45,
    desc: '不主动找人说话，但一旦熟悉起来就是最靠谱的朋友，喜欢画画，课本边角都是她的速写，从不焦虑。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '1', effect: { affinity: 12, money: -55, mental: 8, learning: 4 } },
          { text: '2', effect: { affinity: 12, money: -55, mental: 8, learning: 4 } },
          { text: '3', effect: { affinity: 12, money: -55, mental: 8, learning: 4 } },
          { text: '4', effect: { affinity: 12, money: -55, mental: 8, learning: 4 } },
          { text: '5', effect: { affinity: 12, money: -55, mental: 8, learning: 4 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '1', effect: { affinity: 10, mental: 10, health: 5, effort: 2 } },
          { text: '2', effect: { affinity: 10, mental: 10, health: 5, effort: 2 } },
          { text: '3', effect: { affinity: 10, mental: 10, health: 5, effort: 2 } },
          { text: '4', effect: { affinity: 10, mental: 10, health: 5, effort: 2 } },
          { text: '5', effect: { affinity: 10, mental: 10, health: 5, effort: 2 } },
        ],
      },
    },
  },
  {
    id: 'zhang_s',
    name: '小张',
    emoji: '🎵',
    trait: '文艺',
    defaultAffinity: 45,
    desc: '0',
    bondEvent: {
      story: '0',
      choices: [
        { label: '0', effect: {} },
        { label: '0', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
        ],
      },
    },
  },
  {
    id: 'wu_s',
    name: '小吴',
    emoji: '⚽',
    trait: '运动',
    defaultAffinity: 50,
    desc: '0',
    bondEvent: {
      story: '0',
      choices: [
        { label: '0', effect: {} },
        { label: '0', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
        ],
      },
    },
  },
  {
    id: 'liu_s',
    name: '小刘',
    emoji: '📚',
    trait: '学霸',
    defaultAffinity: 42,
    desc: '0',
    bondEvent: {
      story: '0',
      choices: [
        { label: '0', effect: {} },
        { label: '0', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
        ],
      },
    },
  },
  {
    id: 'sun_s',
    name: '小孙',
    emoji: '🌟',
    trait: '上进',
    defaultAffinity: 48,
    desc: '0',
    bondEvent: {
      story: '0',
      choices: [
        { label: '0', effect: {} },
        { label: '0', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
        ],
      },
    },
  },
  {
    id: 'zhou_s',
    name: '小周',
    emoji: '🎮',
    trait: '宅',
    defaultAffinity: 46,
    desc: '0',
    bondEvent: {
      story: '0',
      choices: [
        { label: '0', effect: {} },
        { label: '0', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
        ],
      },
    },
  },
  {
    id: 'zheng_s',
    name: '小郑',
    emoji: '🤝',
    trait: '热心',
    defaultAffinity: 52,
    desc: '0',
    bondEvent: {
      story: '0',
      choices: [
        { label: '0', effect: {} },
        { label: '0', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
        ],
      },
    },
  },
  {
    id: 'huang_s',
    name: '小黄',
    emoji: '😏',
    trait: '机智',
    defaultAffinity: 47,
    desc: '0',
    bondEvent: {
      story: '0',
      choices: [
        { label: '0', effect: {} },
        { label: '0', effect: {} },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
          { text: '0', effect: { affinity: 0, money: 0 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
          { text: '0', effect: { affinity: 0 } },
        ],
      },
    },
  },
]
