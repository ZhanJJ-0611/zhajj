/* ============================================================
   高中模拟器 — 老师数据库
   ============================================================ */

const TEACHER_POOL = [
  {
    id: 'wang_yw',
    name: '王老师',
    emoji: '👩‍🏫',
    subject: '语文',
    trait: '诗意',
    defaultAffinity: 45,
    desc: '爱书如命，总能在文字里找到意外的光亮，据说书房藏书三千册，课堂上随手一引都是典故。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 12, money: -80, mental: 5, learning: 8 } },
          { text: '2', effect: { affinity: 12, money: -80, mental: 5, learning: 8 } },
          { text: '3', effect: { affinity: 12, money: -80, mental: 5, learning: 8 } },
          { text: '4', effect: { affinity: 12, money: -80, mental: 5, learning: 8 } },
          { text: '5', effect: { affinity: 12, money: -80, mental: 5, learning: 8 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 8, learning: 10, mental: 6 } },
          { text: '2', effect: { affinity: 8, learning: 10, mental: 6 } },
          { text: '3', effect: { affinity: 8, learning: 10, mental: 6 } },
          { text: '4', effect: { affinity: 8, learning: 10, mental: 6 } },
          { text: '5', effect: { affinity: 8, learning: 10, mental: 6 } },
        ],
      },
    },
  },
  {
    id: 'li_sx',
    name: '李老师',
    emoji: '👨‍🏫',
    subject: '数学',
    trait: '严格',
    defaultAffinity: 50,
    desc: '教数学二十年，出了名的严格，但对认真求学的学生格外关照，改卷子时每一道题都会写出详细批注。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 10, money: -60, effort: 8, learning: 5 } },
          { text: '2', effect: { affinity: 10, money: -60, effort: 8, learning: 5 } },
          { text: '3', effect: { affinity: 10, money: -60, effort: 8, learning: 5 } },
          { text: '4', effect: { affinity: 10, money: -60, effort: 8, learning: 5 } },
          { text: '5', effect: { affinity: 10, money: -60, effort: 8, learning: 5 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 6, learning: 12, effort: 5 } },
          { text: '2', effect: { affinity: 6, learning: 12, effort: 5 } },
          { text: '3', effect: { affinity: 6, learning: 12, effort: 5 } },
          { text: '4', effect: { affinity: 6, learning: 12, effort: 5 } },
          { text: '5', effect: { affinity: 6, learning: 12, effort: 5 } },
        ],
      },
    },
  },
  {
    id: 'zhang_yy',
    name: '张老师',
    emoji: '👩‍🏫',
    subject: '英语',
    trait: '温和',
    defaultAffinity: 48,
    desc: '总是面带微笑，会在课后留下来帮同学答疑，课堂气氛轻松，据说曾在海外留学三年，口语极好。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 12, money: -70, mental: 8, learning: 5 } },
          { text: '2', effect: { affinity: 12, money: -70, mental: 8, learning: 5 } },
          { text: '3', effect: { affinity: 12, money: -70, mental: 8, learning: 5 } },
          { text: '4', effect: { affinity: 12, money: -70, mental: 8, learning: 5 } },
          { text: '5', effect: { affinity: 12, money: -70, mental: 8, learning: 5 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 7, learning: 10, mental: 8 } },
          { text: '2', effect: { affinity: 7, learning: 10, mental: 8 } },
          { text: '3', effect: { affinity: 7, learning: 10, mental: 8 } },
          { text: '4', effect: { affinity: 7, learning: 10, mental: 8 } },
          { text: '5', effect: { affinity: 7, learning: 10, mental: 8 } },
        ],
      },
    },
  },
  {
    id: 'chen_wl',
    name: '陈老师',
    emoji: '👨‍🏫',
    subject: '物理',
    trait: '幽默',
    defaultAffinity: 42,
    desc: '讲题时爱用奇怪的比喻，一句"牛顿力学就是生活里的直觉加上数学"让整个年级记住了他，深受学生喜爱。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 14, money: -50, mental: 10, learning: 8 } },
          { text: '2', effect: { affinity: 14, money: -50, mental: 10, learning: 8 } },
          { text: '3', effect: { affinity: 14, money: -50, mental: 10, learning: 8 } },
          { text: '4', effect: { affinity: 14, money: -50, mental: 10, learning: 8 } },
          { text: '5', effect: { affinity: 14, money: -50, mental: 10, learning: 8 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 8, learning: 15, mental: 5 } },
          { text: '2', effect: { affinity: 8, learning: 15, mental: 5 } },
          { text: '3', effect: { affinity: 8, learning: 15, mental: 5 } },
          { text: '4', effect: { affinity: 8, learning: 15, mental: 5 } },
          { text: '5', effect: { affinity: 8, learning: 15, mental: 5 } },
        ],
      },
    },
  },
  {
    id: 'lin_hx',
    name: '林老师',
    emoji: '👩‍🏫',
    subject: '化学',
    trait: '认真',
    defaultAffinity: 44,
    desc: '每次实验课都提前半小时到场检查安全，改作业时用三种颜色标注不同类型的错误，学生们背后叫她"完美主义者"。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 12, money: -90, learning: 8, effort: 5 } },
          { text: '2', effect: { affinity: 12, money: -90, learning: 8, effort: 5 } },
          { text: '3', effect: { affinity: 12, money: -90, learning: 8, effort: 5 } },
          { text: '4', effect: { affinity: 12, money: -90, learning: 8, effort: 5 } },
          { text: '5', effect: { affinity: 12, money: -90, learning: 8, effort: 5 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 7, learning: 12, effort: 8 } },
          { text: '2', effect: { affinity: 7, learning: 12, effort: 8 } },
          { text: '3', effect: { affinity: 7, learning: 12, effort: 8 } },
          { text: '4', effect: { affinity: 7, learning: 12, effort: 8 } },
          { text: '5', effect: { affinity: 7, learning: 12, effort: 8 } },
        ],
      },
    },
  },
  {
    id: 'zhao_ls',
    name: '赵老师',
    emoji: '👨‍🏫',
    subject: '历史',
    trait: '风趣',
    defaultAffinity: 46,
    desc: '用说书人的方式讲历史，课堂上笑声不断，总说"历史不是背年代，是理解人心"，私下里是个资深三国迷。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 15, money: -60, mental: 8, learning: 10 } },
          { text: '2', effect: { affinity: 15, money: -60, mental: 8, learning: 10 } },
          { text: '3', effect: { affinity: 15, money: -60, mental: 8, learning: 10 } },
          { text: '4', effect: { affinity: 15, money: -60, mental: 8, learning: 10 } },
          { text: '5', effect: { affinity: 15, money: -60, mental: 8, learning: 10 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 10, learning: 8, mental: 12 } },
          { text: '2', effect: { affinity: 10, learning: 8, mental: 12 } },
          { text: '3', effect: { affinity: 10, learning: 8, mental: 12 } },
          { text: '4', effect: { affinity: 10, learning: 8, mental: 12 } },
          { text: '5', effect: { affinity: 10, learning: 8, mental: 12 } },
        ],
      },
    },
  },
  {
    id: 'zhou_ty',
    name: '周老师',
    emoji: '👨‍🏫',
    subject: '体育',
    trait: '热情',
    defaultAffinity: 52,
    desc: '每天比学生早到操场，课间总是拉着学生打球，坚信"运动是最好的减压剂"，自己参加过省级田径赛。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 14, money: -50, health: 10, mental: 6 } },
          { text: '2', effect: { affinity: 14, money: -50, health: 10, mental: 6 } },
          { text: '3', effect: { affinity: 14, money: -50, health: 10, mental: 6 } },
          { text: '4', effect: { affinity: 14, money: -50, health: 10, mental: 6 } },
          { text: '5', effect: { affinity: 14, money: -50, health: 10, mental: 6 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 8, health: 15, mental: 10 } },
          { text: '2', effect: { affinity: 8, health: 15, mental: 10 } },
          { text: '3', effect: { affinity: 8, health: 15, mental: 10 } },
          { text: '4', effect: { affinity: 8, health: 15, mental: 10 } },
          { text: '5', effect: { affinity: 8, health: 15, mental: 10 } },
        ],
      },
    },
  },
  {
    id: 'sun_sw',
    name: '孙老师',
    emoji: '👩‍🏫',
    subject: '生物',
    trait: '温柔',
    defaultAffinity: 47,
    desc: '声音轻柔，课堂上从不大声说话，用极有耐心的方式等待学生回答，课间常常在教室角落给绿植浇水。',
    bondEvent: {
      story: '1',
      choices: [
        { label: '2', effect: {} },
        { label: '3', effect: {} },
      ],
    },
    interactions: {
      gift: {
        label: '赠送礼物',
        stories: [
          { text: '1', effect: { affinity: 12, money: -80, learning: 8, mental: 6 } },
          { text: '2', effect: { affinity: 12, money: -80, learning: 8, mental: 6 } },
          { text: '3', effect: { affinity: 12, money: -80, learning: 8, mental: 6 } },
          { text: '4', effect: { affinity: 12, money: -80, learning: 8, mental: 6 } },
          { text: '5', effect: { affinity: 12, money: -80, learning: 8, mental: 6 } },
        ],
      },
      chat: {
        label: '请教聊天',
        stories: [
          { text: '1', effect: { affinity: 7, learning: 12, mental: 8 } },
          { text: '2', effect: { affinity: 7, learning: 12, mental: 8 } },
          { text: '3', effect: { affinity: 7, learning: 12, mental: 8 } },
          { text: '4', effect: { affinity: 7, learning: 12, mental: 8 } },
          { text: '5', effect: { affinity: 7, learning: 12, mental: 8 } },
        ],
      },
    },
  },
]
