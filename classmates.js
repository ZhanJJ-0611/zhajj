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
      story: '高三某天晚自习，你状态很差，一整张卷子几乎写不下去。\n\n小王没像平时那样闹，只是看了你一眼，把你笔抽走：“走。”\n\n你皱眉：“干嘛？”\n\n“透气。”他说。\n\n你被他半拉半拽带到操场，夜风有点凉，他靠在栏杆上没说话。\n\n过了一会儿，他突然说：“我不是不知道你压力大。”\n\n你愣住。\n\n“但你要是一直憋着，会崩的。”他看着远处灯光，“我负责把你拉回来。”\n\n他没再开玩笑。\n\n那一刻你才意识到，他不是只会让你笑。',
      choices: [
        { label: '陪他走', effect: { affinity: 18, mental: 15 } },
        { label: '回去学', effect: { affinity: 6, effort: 6 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '你们在食堂角落坐下，他一边吃一边模仿老师讲课，周围人都忍不住看过来，你差点把饭笑喷。吃完他说：“你今天笑得比做题认真多了。”', effect: { affinity: 12, money: -50, mental: 12, effort: -3 } },
          { text: '他抢着点菜，说“我最懂吃”，结果全是重口味。你被辣得不行，他却笑到停不下来，最后默默把水递给你。', effect: { affinity: 12, money: -50, mental: 11, effort: -3 } },
          { text: '你请他吃饭，他突然认真说：“其实有人一起吃饭挺重要的。”说完又马上转回嬉皮笑脸，让你有点没反应过来。', effect: { affinity: 13, money: -50, mental: 12, effort: -3 } },
          { text: '你们边吃边聊考试，他把一切说得像段子，你本来紧绷的情绪慢慢松下来。', effect: { affinity: 12, money: -50, mental: 11, effort: -3 } },
          { text: '吃完他拍拍你：“行了，补完能量，回去狠狠干。”你莫名觉得被带动了。', effect: { affinity: 13, money: -50, mental: 11, effort: -2 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '晚自习前他拉你去操场打球，你本来不想动，但打着打着出了一身汗，整个人轻松了不少。回教室时他说：“这比刷题有用。”', effect: { affinity: 10, mental: 12, health: 6, effort: -5 } },
          { text: '宿舍熄灯后他还在讲故事，全寝笑到被宿管敲门。你躺在床上忍笑，突然觉得这种日子很难忘。', effect: { affinity: 11, mental: 13, health: 4, effort: -4 } },
          { text: '社团活动他拉你一起上台整活，你一开始很抗拒，结果全场笑翻，你下台时心跳很快，他冲你竖大拇指。', effect: { affinity: 11, mental: 14, health: 5, effort: -4 } },
          { text: '你们在走廊打闹被老师看到，他一个人顶下来，说“我带的节奏”，你心里有点复杂。', effect: { affinity: 12, mental: 12, health: 5, effort: -4 } },
          { text: '放学路上他突然安静，说：“以后可能没这种日子了。”然后又马上笑着转移话题。', effect: { affinity: 13, mental: 13, health: 5, effort: -4 } },
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
      story: '月考前一天晚上，你对着一张压轴题完全卡住。\n\n小李坐在你旁边，看了几分钟，说：“你不是不会，是卡在第一步。”\n\n他没有直接讲，而是让你从头说思路。\n\n你说到一半停住，他轻轻点了点纸：“这里。”\n\n你突然通了。\n\n你抬头，他已经把笔收好：“你能自己走出来，比我讲更重要。”\n\n他站起来要走，又补了一句：“以后这种题，先别慌。”',
      choices: [
        { label: '继续问', effect: { affinity: 16, learning: 16 } },
        { label: '自己想', effect: { affinity: 6, effort: 7 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '你们吃饭时他把草稿纸摊开，一边吃一边给你讲错题，语气平静，你却听得很专注。', effect: { affinity: 11, money: -40, learning: 7, mental: 5 } },
          { text: '他吃得很快，吃完才慢慢跟你聊学习安排，你忽然觉得时间被利用得很满。', effect: { affinity: 11, money: -40, learning: 6, mental: 5 } },
          { text: '他说“其实你基础不差”，你有点意外，但也开始相信一点。', effect: { affinity: 12, money: -40, learning: 7, mental: 6 } },
          { text: '你们聊未来，他语气很理性，但不是冷漠，而是认真在规划。', effect: { affinity: 11, money: -40, learning: 6, mental: 5 } },
          { text: '临走前他说：“明天那套卷子记得先做选择题。”你点了点头。', effect: { affinity: 11, money: -40, learning: 7, mental: 5 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '你说放松一下，他却带你去图书馆自习室：“换个环境也算休息。”结果效率意外很高。', effect: { affinity: 9, learning: 11, effort: 8, mental: 3 } },
          { text: '你们在教室最后一排“边聊边学”，他会偶尔停下来问你理解没有。', effect: { affinity: 9, learning: 11, effort: 8, mental: 3 } },
          { text: '晚自习间隙他带你快速复盘当天内容，你第一次觉得学习有节奏。', effect: { affinity: 9, learning: 12, effort: 8, mental: 3 } },
          { text: '你们一起做一套题，比谁更快更准，气氛有点紧张但很有成就感。', effect: { affinity: 10, learning: 12, effort: 9, mental: 3 } },
          { text: '他偶尔也会放松，跟你聊点别的，但很快又把话题拉回正轨。', effect: { affinity: 9, learning: 10, effort: 8, mental: 4 } },
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
      story: '他带你绕了很远去一家小店。\n\n你有点怀疑：“值得吗？”\n\n他只说：“信我。”\n\n第一口下去，你愣住了。\n\n他得意地笑：“我不会带错地方。”\n\n然后他忽然认真了一下：“也不会随便带人来。”',
      choices: [
        { label: '继续吃', effect: { affinity: 16, mental: 13 } },
        { label: '调侃他', effect: { affinity: 10, mental: 8 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '他带你点了一整桌，说“今天带你见世面”，你们吃到撑才停。', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
          { text: '他一边吃一边讲每道菜的故事，你听得像在旅行。', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
          { text: '你说随便吃点，他却认真选店，让你有点感动。', effect: { affinity: 15, money: -70, mental: 13, health: -3 } },
          { text: '你们边吃边聊生活，他的世界好像总是很轻松。', effect: { affinity: 14, money: -70, mental: 12, health: -3 } },
          { text: '他说“以后带你吃遍这条街”，语气很自然。', effect: { affinity: 15, money: -70, mental: 13, health: -3 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '你们放学后一起“探店”，从街头吃到巷尾，最后坐在路边休息。', effect: { affinity: 11, mental: 11, health: -5, effort: -4 } },
          { text: '他带你去夜市，你第一次觉得学习之外的世界这么热闹。', effect: { affinity: 12, mental: 12, health: -5, effort: -4 } },
          { text: '你们边走边聊未来，他说“人总要去看看别的地方”。', effect: { affinity: 11, mental: 11, health: -5, effort: -4 } },
          { text: '他突然停下来买小吃递给你，说“这个必须吃”。', effect: { affinity: 11, mental: 10, health: -5, effort: -4 } },
          { text: '回去路上你有点累，但心情很好。', effect: { affinity: 12, mental: 11, health: -5, effort: -4 } },
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
      story: '你那天情绪很差，他却没有开玩笑。\n\n只是坐在你旁边，什么都没说。\n\n过了一会儿，他低声说：“我今天不逗你。”\n\n你有点愣。\n\n他看着你：“你要是想说，我听。”\n\n“要是不想说，我就陪你坐着。”',
      choices: [
        { label: '聊聊', effect: { affinity: 17, mental: 14 } },
        { label: '沉默', effect: { affinity: 10, mental: 9 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '他一边吃一边演老师讲课，整桌人都笑疯了。', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '你笑到停不下来，他说“这顿值了”。', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '他把日常讲成段子，你连压力都忘了。', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '你问他怎么这么会说，他说“习惯了”。', effect: { affinity: 13, money: -45, mental: 15, effort: -3 } },
          { text: '吃完他说“你笑就够了”。', effect: { affinity: 14, money: -45, mental: 16, effort: -3 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '他在班里带节奏整活，你被拉进去，一开始尴尬后来笑到停不下来。', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
          { text: '社团活动他直接上台，你被他拉着一起演。', effect: { affinity: 11, mental: 13, health: 8, effort: -5 } },
          { text: '你们在操场聊天，他突然模仿全班同学。', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
          { text: '他把普通一天过得像段子。', effect: { affinity: 10, mental: 12, health: 8, effort: -5 } },
          { text: '最后他认真说：“你别总那么紧。”', effect: { affinity: 11, mental: 13, health: 8, effort: -4 } },
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
      story: '你偶然看到她在画你。\n\n她愣了一下，想合上本子。\n\n你说：“可以看吗？”\n\n她犹豫了一秒，递给你。\n\n画里的你很安静，比现实更认真一点。\n\n她轻声说：“你那天低头写题的时候……挺好看的。”',
      choices: [
        { label: '认真看', effect: { affinity: 16, mental: 12 } },
        { label: '调侃她', effect: { affinity: 9, mental: 6 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '你们坐在窗边吃饭，她一边听你说话一边在纸巾上画小图，你发现是刚才的场景。', effect: { affinity: 12, money: -55, mental: 9, learning: 4 } },
          { text: '她吃得很慢，偶尔抬头看你一眼，然后轻轻笑一下。', effect: { affinity: 12, money: -55, mental: 8, learning: 4 } },
          { text: '你说最近很累，她没说大道理，只是轻声说：“慢一点也没关系。”', effect: { affinity: 13, money: -55, mental: 10, learning: 4 } },
          { text: '你们几乎没怎么说话，但气氛却很舒服。', effect: { affinity: 12, money: -55, mental: 9, learning: 4 } },
          { text: '她最后把一张小画塞给你：“给你留着。”', effect: { affinity: 14, money: -55, mental: 10, learning: 4 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '你们一起在教室画黑板报，她负责画，你负责递粉笔，时间过得很慢但很安静。', effect: { affinity: 10, mental: 11, health: 5, effort: 2 } },
          { text: '晚自习后她带你去看天台的夜景，风很轻，她只是站着看。', effect: { affinity: 11, mental: 12, health: 5, effort: 2 } },
          { text: '你陪她画画，她偶尔会让你试着画，你发现自己居然也能画一点。', effect: { affinity: 10, mental: 10, health: 5, effort: 2 } },
          { text: '她在你书本上画了个小人，你之后每次翻到都会看一眼。', effect: { affinity: 11, mental: 11, health: 5, effort: 2 } },
          { text: '你们一起整理教室布置，她默默把最累的部分做完。', effect: { affinity: 12, mental: 10, health: 5, effort: 2 } },
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
    desc: '喜欢音乐和文字，常常一个人戴着耳机发呆，写过很多没人看过的歌词。',
    bondEvent: {
      story: '你偶然听到她在教室弹吉他。\n\n她看到你，有点慌：“我弹得一般……”\n\n你摇头。\n\n她犹豫了一下，把一段旋律重新弹了一遍。\n\n“这首还没写完。”她说，“但我一直想让人听一次。”',
      choices: [
        { label: '认真听', effect: { affinity: 16, mental: 13 } },
        { label: '轻轻夸', effect: { affinity: 10, mental: 8 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '她边吃边跟你分享最近听的歌，眼睛有点亮。', effect: { affinity: 12, money: -50, mental: 10 } },
          { text: '你们聊音乐，她突然说：“有些歌会陪你很久。”', effect: { affinity: 13, money: -50, mental: 11 } },
          { text: '她给你推荐歌单，你默默记下来。', effect: { affinity: 12, money: -50, mental: 10 } },
          { text: '你们安静吃饭，各自戴着耳机听同一首歌。', effect: { affinity: 13, money: -50, mental: 11 } },
          { text: '她轻声说：“以后再一起听。”', effect: { affinity: 14, money: -50, mental: 12 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '她拉你去音乐教室，你第一次认真听她弹完一首歌。', effect: { affinity: 11, mental: 12 } },
          { text: '你们一起写歌词，她让你填一句。', effect: { affinity: 11, mental: 11 } },
          { text: '放学路上她给你分享耳机。', effect: { affinity: 12, mental: 12 } },
          { text: '你们在走廊小声哼歌。', effect: { affinity: 10, mental: 11 } },
          { text: '她说：“有些瞬间要记住。”', effect: { affinity: 12, mental: 12 } },
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
    desc: '精力旺盛，几乎每天都在操场上，性格直接，带着你一起动起来。',
    bondEvent: {
      story: '他拉你跑步，你一开始跟不上。\n\n你气喘吁吁想停，他回头看你：“再坚持一下。”\n\n你咬牙跟上。\n\n最后停下时你整个人都轻了。\n\n他笑着拍你：“你比你自己想的强。”',
      choices: [
        { label: '继续练', effect: { affinity: 15, health: 12 } },
        { label: '休息', effect: { affinity: 7, health: 6 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '他吃得很快，说“补能量最重要”。', effect: { affinity: 12, money: -50, health: 10, mental: 6 } },
          { text: '你们边吃边聊训练，他很认真。', effect: { affinity: 12, money: -50, health: 10, mental: 6 } },
          { text: '他说你体能进步了。', effect: { affinity: 13, money: -50, health: 11, mental: 6 } },
          { text: '你们吃完直接去操场。', effect: { affinity: 12, money: -50, health: 10, mental: 6 } },
          { text: '他说“下次我请”。', effect: { affinity: 13, money: -50, health: 10, mental: 7 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '他带你打球，你从跟不上到能参与。', effect: { affinity: 10, health: 15, mental: 10 } },
          { text: '你们一起跑步，节奏慢慢一致。', effect: { affinity: 10, health: 15, mental: 10 } },
          { text: '他教你动作，很耐心。', effect: { affinity: 11, health: 15, mental: 10 } },
          { text: '你们一起出汗，整个人轻松。', effect: { affinity: 10, health: 15, mental: 10 } },
          { text: '他说“以后一起练”。', effect: { affinity: 11, health: 15, mental: 10 } },
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
    desc: '成绩顶尖但不张扬，逻辑清晰，说话简短，但关键时候很可靠。',
    bondEvent: {
      story: '你问他一道压轴题。\n\n他看了一眼，说：“这题不难。”\n\n你有点不服。\n\n他把过程写出来，每一步都很干净。\n\n你看懂了。\n\n他淡淡说：“你只是想复杂了。”',
      choices: [
        { label: '继续问', effect: { affinity: 14, learning: 16 } },
        { label: '自己做', effect: { affinity: 6, effort: 8 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '他吃饭时也在想题，你忍不住笑。', effect: { affinity: 11, money: -40, learning: 7 } },
          { text: '你们讨论题目，他逻辑很清晰。', effect: { affinity: 11, money: -40, learning: 7 } },
          { text: '他说你有潜力。', effect: { affinity: 12, money: -40, learning: 8 } },
          { text: '你们交流方法。', effect: { affinity: 11, money: -40, learning: 7 } },
          { text: '他说“别急”。', effect: { affinity: 12, money: -40, learning: 7 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '你们一起刷题，比效率。', effect: { affinity: 10, learning: 12, effort: 8 } },
          { text: '他教你思路，你进步明显。', effect: { affinity: 10, learning: 13, effort: 8 } },
          { text: '你们沉默但专注。', effect: { affinity: 9, learning: 12, effort: 8 } },
          { text: '他偶尔讲解关键点。', effect: { affinity: 10, learning: 13, effort: 8 } },
          { text: '你开始跟上他的节奏。', effect: { affinity: 11, learning: 13, effort: 8 } },
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
    desc: '目标明确，行动力强，总在努力往前走，会不自觉带动身边的人。',
    bondEvent: {
      story: '你看到他在教室最晚离开。\n\n你问他累不累。\n\n他说：“累，但不想停。”\n\n他看你一眼：“你也可以更强。”',
      choices: [
        { label: '一起学', effect: { affinity: 15, effort: 12 } },
        { label: '点头', effect: { affinity: 7, effort: 6 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '你们聊目标，他很坚定。', effect: { affinity: 12, money: -50, learning: 6 } },
          { text: '他说未来规划。', effect: { affinity: 12, money: -50, learning: 6 } },
          { text: '你被带动了。', effect: { affinity: 13, money: -50, learning: 7 } },
          { text: '他鼓励你。', effect: { affinity: 12, money: -50, learning: 6 } },
          { text: '他说“一起努力”。', effect: { affinity: 13, money: -50, learning: 7 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '他说放松也要有计划。', effect: { affinity: 10, learning: 11, effort: 9 } },
          { text: '你们一起制定计划。', effect: { affinity: 10, learning: 11, effort: 9 } },
          { text: '他带你复盘。', effect: { affinity: 10, learning: 12, effort: 9 } },
          { text: '你逐渐跟上节奏。', effect: { affinity: 11, learning: 12, effort: 9 } },
          { text: '他说“别停”。', effect: { affinity: 11, learning: 11, effort: 9 } },
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
    desc: '安静内向，喜欢游戏和电子产品，熟了之后其实很有话聊。',
    bondEvent: {
      story: '他难得主动叫你：“来一局？”\n\n你有点意外。\n\n你们打完一局，他笑了：“原来你还挺强。”\n\n“以后可以一起。”',
      choices: [
        { label: '继续玩', effect: { affinity: 14, mental: 10 } },
        { label: '下次再说', effect: { affinity: 7 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '他一边吃一边聊游戏。', effect: { affinity: 11, money: -40, mental: 8 } },
          { text: '你们讨论策略。', effect: { affinity: 11, money: -40, mental: 8 } },
          { text: '他慢慢话多起来。', effect: { affinity: 12, money: -40, mental: 9 } },
          { text: '气氛轻松。', effect: { affinity: 11, money: -40, mental: 8 } },
          { text: '他说“挺开心的”。', effect: { affinity: 12, money: -40, mental: 9 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '你们一起打游戏，配合越来越默契。', effect: { affinity: 10, mental: 11 } },
          { text: '他教你操作。', effect: { affinity: 10, mental: 10 } },
          { text: '你们聊剧情。', effect: { affinity: 10, mental: 10 } },
          { text: '他开始主动找你。', effect: { affinity: 11, mental: 11 } },
          { text: '他说“下次继续”。', effect: { affinity: 11, mental: 11 } },
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
    desc: '总是第一个站出来帮忙的人，班级里的“润滑剂”，和谁都能处得来。',
    bondEvent: {
      story: '你有点崩，他什么都没问。\n\n只是递水给你：“先缓一下。”\n\n你突然有点想说话。\n\n他说：“我在。”',
      choices: [
        { label: '说出来', effect: { affinity: 16, mental: 14 } },
        { label: '点头', effect: { affinity: 9, mental: 8 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '他总是照顾你。', effect: { affinity: 13, money: -50, mental: 9 } },
          { text: '他说“慢慢来”。', effect: { affinity: 13, money: -50, mental: 9 } },
          { text: '气氛很安心。', effect: { affinity: 13, money: -50, mental: 9 } },
          { text: '你被照顾到了。', effect: { affinity: 14, money: -50, mental: 10 } },
          { text: '他说“别客气”。', effect: { affinity: 13, money: -50, mental: 9 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '他帮你处理事情。', effect: { affinity: 10, mental: 11 } },
          { text: '你们一起做活动。', effect: { affinity: 10, mental: 11 } },
          { text: '他总在关键时刻出现。', effect: { affinity: 11, mental: 11 } },
          { text: '你越来越依赖他。', effect: { affinity: 11, mental: 12 } },
          { text: '他说“我一直在”。', effect: { affinity: 12, mental: 12 } },
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
    desc: '反应快，嘴毒但不坏，关键时刻总能看透问题。',
    bondEvent: {
      story: '你被一道题卡住，他看了一眼：“你想多了。”\n\n他一句话点醒你。\n\n你愣住。\n\n他笑：“脑子不错，就是容易绕。”',
      choices: [
        { label: '继续问', effect: { affinity: 15, learning: 12 } },
        { label: '吐槽他', effect: { affinity: 9, mental: 6 } },
      ],
    },
    interactions: {
      meal: {
        label: '请客吃饭',
        stories: [
          { text: '他一边吃一边吐槽你。', effect: { affinity: 12, money: -50, mental: 9 } },
          { text: '你反击，他笑了。', effect: { affinity: 12, money: -50, mental: 9 } },
          { text: '你们互怼很开心。', effect: { affinity: 13, money: -50, mental: 10 } },
          { text: '他说“你进步了”。', effect: { affinity: 13, money: -50, mental: 10 } },
          { text: '气氛轻松。', effect: { affinity: 12, money: -50, mental: 9 } },
        ],
      },
      play: {
        label: '一起玩耍',
        stories: [
          { text: '你们斗嘴一整天。', effect: { affinity: 10, mental: 11 } },
          { text: '他总能接住你的话。', effect: { affinity: 10, mental: 11 } },
          { text: '你们默契变好。', effect: { affinity: 11, mental: 11 } },
          { text: '他偶尔认真帮你。', effect: { affinity: 11, mental: 10 } },
          { text: '他说“别想太复杂”。', effect: { affinity: 11, mental: 10 } },
        ],
      },
    },
  }
]
