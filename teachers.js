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
    story: '晚自习结束后的教学楼格外安静，你路过语文办公室时，发现门虚掩着，暖黄色的灯光从里面溢出来。你下意识停住脚步。\n\n王老师坐在窗边，窗外是模糊的夜色，她正低头读书，一只手无意识地在书页边缘轻轻摩挲。桌上摊着几本翻旧的书，还有一只已经凉掉的茶杯。\n\n她似乎察觉到门口的动静，抬起头来，看见是你，微微一愣，随即露出一个温和的笑：“这么晚还没走？”\n\n你有点不好意思，她却已经轻轻招手：“进来吧，外面冷。刚好我也不太想一个人待着。”\n\n你走进去坐下，她把书轻轻合上，书页里夹着一张泛黄的旧纸条。她没有继续看书，而是把注意力放在你身上，像是在等你开口。',
    choices: [
      {
        label: '认真请教',
        effect: { affinity: 12, learning: 15, mental: 6 }
      },
      {
        label: '陪她聊天',
        effect: { affinity: 15, mental: 10 }
      },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        {
          text: '你递上一本精装诗集。王老师接过时很小心，像是在接一件易碎的东西。她翻开几页，轻声念出一句诗，声音低得像是在对自己说话。\n\n念完后，她沉默了一小会儿，才抬头看你：“这种句子，会在人最难的时候，突然把人拉住。”\n\n她把书收进抽屉，却没有完全合上，像是打算很快再拿出来。',
          effect: { affinity: 12, money: -80, mental: 6, learning: 8 }
        },
        {
          text: '你送她一支钢笔。她当场试写，在草稿纸上慢慢写下你的名字，一笔一划都很稳。\n\n“字不用急着好看，”她笑了笑，“但要一笔一笔写清楚。很多事情也是一样。”\n\n她把那张写着你名字的纸递给你，你莫名有点舍不得折起来。',
          effect: { affinity: 12, money: -80, mental: 5, learning: 8 }
        },
        {
          text: '你送了一本自己做满批注的旧书。王老师翻着那些歪歪扭扭的标记，有的地方甚至写满了疑问。\n\n她没有笑，只是很认真地看完几页，说：“读书最难得的，不是读得快，而是你愿意停下来问。”\n\n她把书还给你时，在其中一页悄悄夹了一张小纸条。',
          effect: { affinity: 13, money: -80, mental: 6, learning: 10 }
        },
        {
          text: '你送了一枚简单的书签，上面写着一句你喜欢的话。她看了很久，没有立刻说话。\n\n“我年轻的时候，也抄过很多这样的话。”她轻声说，“后来才发现，有些句子，是要很多年之后才会真正懂。”\n\n她把书签夹进正在读的书里，动作很轻。',
          effect: { affinity: 12, money: -80, mental: 7, learning: 7 }
        },
        {
          text: '你带来一本古典散文集。她翻开时，纸页发出很轻的声响。\n\n“这些文章啊，”她笑了笑，“看起来写的是别人，其实都是在写自己。”\n\n她忽然抬头看你一眼：“以后你也会有想写却写不出来的时候，那时候再来翻这些书。”',
          effect: { affinity: 12, money: -80, mental: 6, learning: 9 }
        },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        {
          text: '你问她怎么写好作文。她没有直接讲结构或模板，而是问你：“最近有没有哪一句话，让你停下来很久？”\n\n你愣了一下。\n\n她笑了笑：“写作不是把话说漂亮，是把你真正停下来过的地方写出来。”',
          effect: { affinity: 8, learning: 12, mental: 7 }
        },
        {
          text: '你抱怨古文太难，总是读不进去。她没有反驳，只是翻开课本，给你读了一小段。\n\n她读得很慢，语气平静。\n\n“他们写这些的时候，”她说，“也没想过几百年后会有人考试用。但他们一定想过，会不会有人读懂。”\n\n你忽然有点不想把它当成题目了。',
          effect: { affinity: 8, learning: 10, mental: 8 }
        },
        {
          text: '你问她为什么一直教语文。她想了很久，才说：“因为语言是人留下来的痕迹。”\n\n她看向窗外：“人会走，但说过的话、写下的东西，有时候会留下来，替他陪别人一段路。”\n\n你不知道为什么，突然有点安静下来。',
          effect: { affinity: 9, learning: 10, mental: 9 }
        },
        {
          text: '你拿着作文找她修改。她没有像别的老师那样大改，而是在边上写下零碎的评语。\n\n“这里很真。”\n“这里可以再慢一点。”\n“这句话，你其实没说完。”\n\n你看着那些批注，感觉像是在被认真听完一段话。',
          effect: { affinity: 10, learning: 12, mental: 8 }
        },
        {
          text: '你问她有没有什么应试技巧。她笑了一下，没有正面回答。\n\n“考试会结束的，”她说，“但有些句子，如果你真的懂过，是会一直陪着你的。”\n\n她顿了顿，又补了一句：“当然，分数也很重要——但别只剩下分数。”',
          effect: { affinity: 8, learning: 11, mental: 7 }
        },
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
    story: '晚自习已经结束很久，教室里只剩下零散的灯光。你正准备离开时，发现讲台上还站着一个人。\n\n李老师没有坐下，他一手撑着讲台，一手拿着红笔，在一叠试卷上快速写着什么。整间教室安静得只剩下笔尖划过纸面的声音。\n\n你本想悄悄离开，他却头也不抬地说：“那道立体几何，今天错了吧。”\n\n你一愣。\n\n他把其中一张卷子抽出来，放到你面前，上面密密麻麻写满了批注，连你自己都没注意到的小错误都被圈了出来。\n\n“不是不会，”他说，“是你每一步都没走稳。”\n\n他这才抬头看你一眼，语气依旧严厉，却没有赶你走：“坐下，把这题重做一遍。我看着。”',
    choices: [
      {
        label: '坐下重做',
        effect: { affinity: 12, learning: 18, effort: 10 }
      },
      {
        label: '紧张离开',
        effect: { affinity: 2, learning: 6 }
      },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        {
          text: '你递上一支质量不错的中性笔。李老师看了一眼，没有立刻接。\n\n“笔不是关键，”他说，“关键是你用它写了什么。”\n\n话是这么说，他还是收下了。第二天发下来的作业本上，他用这支笔给你写了整整一页批注。',
          effect: { affinity: 10, money: -60, effort: 8, learning: 6 }
        },
        {
          text: '你送了一本习题集。李老师翻了几页，点了点头：“题选得还可以。”\n\n他合上书，看着你：“但你要是只做一半，就等于没买。”\n\n之后的几周，他开始偶尔抽查你这本书的进度。',
          effect: { affinity: 11, money: -60, effort: 10, learning: 6 }
        },
        {
          text: '你送了一本整理得很整齐的错题本。李老师看得很认真，一页一页翻过去。\n\n“这才叫在学。”他说。\n\n他在其中几道题旁边又补了新的解法，还标了“必须再做一遍”。',
          effect: { affinity: 13, money: -60, effort: 10, learning: 8 }
        },
        {
          text: '你送了一把简单的直尺。李老师看了一眼，语气依旧平淡：“画图能不能标准，直接影响你后面全错还是全对。”\n\n他把尺子收进讲台抽屉：“以后上课带着。”\n\n你后来发现，他确实会看你有没有用它。',
          effect: { affinity: 10, money: -60, effort: 9, learning: 5 }
        },
        {
          text: '你送了一本笔记本。李老师翻开空白页，在第一页写下一行字：\n\n“每一道题，写清楚每一步。”\n\n他把本子递回给你：“写满再给我看。”\n\n那一刻你突然感觉，这不是礼物，更像一个长期任务。',
          effect: { affinity: 12, money: -60, effort: 10, learning: 7 }
        },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        {
          text: '你问他怎么提高数学成绩。他没有安慰你，也没有讲方法。\n\n“先把你最近三张卷子的错题，全部重做一遍，”他说，“一题不漏。”\n\n你有点头大。\n\n他看了你一眼：“做完再来问我为什么。”',
          effect: { affinity: 6, learning: 14, effort: 8 }
        },
        {
          text: '你说自己总是粗心。他直接把你的卷子摊开，指着一道题：“这里不是粗心，是你没检查。”\n\n他用笔敲了敲桌子：“不要用‘粗心’这种词给自己找借口。”\n\n你有点不舒服，但也说不出反驳的话。',
          effect: { affinity: 5, learning: 12, effort: 7 }
        },
        {
          text: '你问一道不会的题。他没有直接讲解，而是让你先说思路。\n\n你讲到一半卡住，他才接过话：“你这里跳了一步。”\n\n他把完整推导写出来，但每一步都停一下确认你跟上了没有。',
          effect: { affinity: 7, learning: 15, effort: 6 }
        },
        {
          text: '你问他为什么这么严格。他沉默了一下，说：“因为考试不会对你宽松。”\n\n他顿了顿，又补一句：“但我可以在你还没上考场之前，把问题都指出来。”\n\n语气依旧硬，但你忽然明白了一点什么。',
          effect: { affinity: 7, learning: 11, effort: 6 }
        },
        {
          text: '有一次你考得不错，把卷子递给他。他没有表扬，只是翻到最后一题：“这题，你其实可以再优化一步。”\n\n你有点失落。\n\n他却在角落写了一句很小的字：“整体有进步，继续。”\n\n如果不是仔细看，你几乎会错过。',
          effect: { affinity: 8, learning: 13, effort: 6 }
        },
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
    story: '那天放学后，你被她叫住。\n\n“陪我走一会儿？”她笑着说。\n\n你们在校园里慢慢走，她忽然开始用英语跟你聊天，从简单的句子到自然的表达。\n\n你有点卡壳，她也不纠正，只是耐心等你说完。\n\n走到操场边，她停下来：“其实语言不是考试，是你能不能把自己说出来。”\n\n她轻轻拍了拍你的肩：“以后不懂的，不用怕说错，来找我。”\n\n那一刻你感觉，她不只是老师，更像一个一直站在你这边的人。',
    choices: [
      { label: '继续聊', effect: { affinity: 15, learning: 12, mental: 10 } },
      { label: '有点害羞', effect: { affinity: 6, mental: 6 } },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        { text: '你送她一本英文小说。她笑着翻开：“等你哪天能用原文跟我聊，我们再讨论结局。”', effect: { affinity: 12, money: -70, mental: 8, learning: 6 } },
        { text: '你送了一张明信片。她看了很久：“语言是用来连接世界的，你以后会走很远。”', effect: { affinity: 12, money: -70, mental: 9, learning: 5 } },
        { text: '你送她一支笔。她用英语写下一句简单的话递给你：“Keep going.”', effect: { affinity: 12, money: -70, mental: 8, learning: 5 } },
        { text: '你送她单词卡片。她笑：“那我也要抽查你了。”语气轻松却认真。', effect: { affinity: 12, money: -70, mental: 7, learning: 6 } },
        { text: '你送她一本笔记。她在第一页写：“Write freely.”', effect: { affinity: 12, money: -70, mental: 8, learning: 6 } },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        { text: '你问口语。她说：“先别想着标准，先敢说。”', effect: { affinity: 7, learning: 11, mental: 9 } },
        { text: '你读错句子，她没打断，只在你说完后轻轻重复正确版本。', effect: { affinity: 7, learning: 10, mental: 8 } },
        { text: '你说不敢开口。她笑：“我当年也是。”', effect: { affinity: 8, learning: 9, mental: 10 } },
        { text: '你问作文。她说：“写你真的想说的。”', effect: { affinity: 7, learning: 11, mental: 8 } },
        { text: '她偶尔跟你用英语闲聊，像朋友一样。', effect: { affinity: 8, learning: 10, mental: 9 } },
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
    story: '晚自习后你被他叫住。\n\n他把一张题递给你：“最后一道，你其实已经会了。”\n\n你一脸疑惑。\n\n他笑着说：“差的不是能力，是最后那点自信。”\n\n他没有讲题，而是看着你一步步推。\n\n你终于做出来时，他轻轻拍桌：“你看，这不就会了吗？”\n\n他笑得像个朋友：“以后别老觉得自己不行。”',
    choices: [
      { label: '继续问', effect: { affinity: 16, learning: 15, mental: 8 } },
      { label: '点点头', effect: { affinity: 8, mental: 6 } },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        { text: '你送个小摆件。他笑：“这玩意受力分析挺复杂。”', effect: { affinity: 14, money: -50, mental: 10, learning: 8 } },
        { text: '你送本题集。他说：“做完我请你喝水。”', effect: { affinity: 14, money: -50, mental: 9, learning: 9 } },
        { text: '你送笔。他立刻用来画受力图。', effect: { affinity: 14, money: -50, mental: 9, learning: 8 } },
        { text: '你送本子。他写：“别怕难题。”', effect: { affinity: 14, money: -50, mental: 10, learning: 8 } },
        { text: '你送模型。他开始现场讲原理。', effect: { affinity: 15, money: -50, mental: 11, learning: 9 } },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        { text: '他把难题讲成生活例子，你忍不住笑。', effect: { affinity: 8, learning: 15, mental: 6 } },
        { text: '你卡住，他说：“就差一步。”', effect: { affinity: 8, learning: 14, mental: 5 } },
        { text: '他说：“物理就是讲道理。”', effect: { affinity: 8, learning: 15, mental: 5 } },
        { text: '你做对题，他比你还开心。', effect: { affinity: 9, learning: 13, mental: 6 } },
        { text: '他偶尔和你吐槽题目出得离谱。', effect: { affinity: 9, learning: 14, mental: 6 } },
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
    story: '实验结束后，她把你留下。\n\n“你今天步骤对了。”她说。\n\n你有点意外。\n\n她翻开你的记录本，每一处细节都被标好。\n\n“认真做事的人，我看得出来。”\n\n她停了一下：“以后可以来实验室帮我。”\n\n语气很淡，但你听出了信任。',
    choices: [
      { label: '答应', effect: { affinity: 15, learning: 12, effort: 10 } },
      { label: '有点紧张', effect: { affinity: 6, effort: 5 } },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        { text: '你送实验笔记，她逐页检查。', effect: { affinity: 12, money: -90, learning: 9, effort: 6 } },
        { text: '你送工具，她说：“要用规范。”', effect: { affinity: 12, money: -90, learning: 8, effort: 6 } },
        { text: '你送本子，她帮你规划记录格式。', effect: { affinity: 12, money: -90, learning: 9, effort: 7 } },
        { text: '你送书，她标出重点章节。', effect: { affinity: 12, money: -90, learning: 9, effort: 6 } },
        { text: '你送小礼物，她轻声说谢谢。', effect: { affinity: 11, money: -90, learning: 8, effort: 5 } },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        { text: '她一步步纠正你的实验逻辑。', effect: { affinity: 7, learning: 13, effort: 9 } },
        { text: '她说：“细节决定结果。”', effect: { affinity: 7, learning: 12, effort: 8 } },
        { text: '你写错，她让你重做。', effect: { affinity: 6, learning: 12, effort: 9 } },
        { text: '她偶尔会轻声表扬你。', effect: { affinity: 8, learning: 12, effort: 8 } },
        { text: '她教你如何规范记录。', effect: { affinity: 7, learning: 13, effort: 9 } },
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
    story: '他把你叫去办公室，拿出一张旧地图。\n\n“你觉得这里为什么会打仗？”\n\n你说了自己的看法。\n\n他点头：“不错。”\n\n然后他笑：“历史不是答案，是你怎么看人。”\n\n他拍拍你肩：“你已经开始会想了。”',
    choices: [
      { label: '继续聊', effect: { affinity: 16, learning: 10, mental: 12 } },
      { label: '若有所思', effect: { affinity: 8, mental: 8 } },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        { text: '你送三国书，他眼睛一亮。', effect: { affinity: 15, money: -60, mental: 9, learning: 10 } },
        { text: '你送地图，他开始讲故事。', effect: { affinity: 15, money: -60, mental: 10, learning: 9 } },
        { text: '你送笔，他边写边讲典故。', effect: { affinity: 15, money: -60, mental: 9, learning: 10 } },
        { text: '你送书签，他说“有意思”。', effect: { affinity: 14, money: -60, mental: 8, learning: 9 } },
        { text: '你送本子，他写下一句评语。', effect: { affinity: 15, money: -60, mental: 9, learning: 10 } },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        { text: '他把历史讲成故事。', effect: { affinity: 10, learning: 8, mental: 12 } },
        { text: '他说：“人心最难。”', effect: { affinity: 10, learning: 8, mental: 12 } },
        { text: '你和他讨论人物选择。', effect: { affinity: 11, learning: 9, mental: 12 } },
        { text: '他会认真听你的理解。', effect: { affinity: 11, learning: 8, mental: 13 } },
        { text: '像朋友一样聊天。', effect: { affinity: 12, learning: 8, mental: 12 } },
      ],
    },
  },
  },
  {
  id: 'zhou_dl',
  name: '周老师',
  emoji: '👨‍🏫',
  subject: '地理',
  trait: '热情',
  defaultAffinity: 52,
  desc: '喜欢把世界地图贴满教室，会用旅行故事讲地理，常说“地理不是背，是理解世界怎么运转”。',
  bondEvent: {
    story: '他把你叫到地图前。\n\n“你以后想去哪？”\n\n你随口说了个地方。\n\n他认真地帮你分析气候、地形、城市。\n\n最后笑着说：“不是梦，规划一下就能去。”\n\n那一刻你突然觉得世界变得具体了。',
    choices: [
      { label: '认真听', effect: { affinity: 15, learning: 12, mental: 10 } },
      { label: '笑一笑', effect: { affinity: 7, mental: 6 } },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        { text: '你送地图，他立刻展开讲解。', effect: { affinity: 14, money: -50, health: 10, mental: 6 } },
        { text: '你送地球仪，他很开心。', effect: { affinity: 15, money: -50, health: 10, mental: 7 } },
        { text: '你送书，他推荐你读更多。', effect: { affinity: 14, money: -50, health: 9, mental: 6 } },
        { text: '你送笔，他画路线给你看。', effect: { affinity: 14, money: -50, health: 9, mental: 6 } },
        { text: '你送本子，他让你记旅行计划。', effect: { affinity: 15, money: -50, health: 10, mental: 7 } },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        { text: '他把知识讲成旅行。', effect: { affinity: 8, health: 15, mental: 10 } },
        { text: '他说：“世界很大。”', effect: { affinity: 8, health: 14, mental: 10 } },
        { text: '你聊未来，他很认真。', effect: { affinity: 9, health: 14, mental: 11 } },
        { text: '他鼓励你走出去。', effect: { affinity: 8, health: 15, mental: 10 } },
        { text: '像朋友一样聊天。', effect: { affinity: 9, health: 14, mental: 10 } },
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
    story: '你帮她一起给植物浇水。\n\n她轻声说：“它们长得慢，但一直在长。”\n\n她看向你：“人也是。”\n\n她没有多说什么，只是把水壶递给你。\n\n那一刻你感觉很安静，很安心。',
    choices: [
      { label: '继续帮', effect: { affinity: 14, learning: 10, mental: 12 } },
      { label: '点点头', effect: { affinity: 7, mental: 8 } },
    ],
  },
  interactions: {
    gift: {
      label: '赠送礼物',
      stories: [
        { text: '你送植物，她很珍惜。', effect: { affinity: 13, money: -80, learning: 8, mental: 7 } },
        { text: '你送书，她轻声道谢。', effect: { affinity: 12, money: -80, learning: 8, mental: 6 } },
        { text: '你送本子，她帮你整理知识。', effect: { affinity: 12, money: -80, learning: 9, mental: 6 } },
        { text: '你送卡片，她看了很久。', effect: { affinity: 13, money: -80, learning: 8, mental: 7 } },
        { text: '你送笔，她写得很慢很认真。', effect: { affinity: 12, money: -80, learning: 8, mental: 6 } },
      ],
    },
    chat: {
      label: '请教聊天',
      stories: [
        { text: '她慢慢解释概念。', effect: { affinity: 7, learning: 12, mental: 9 } },
        { text: '她会等你想清楚再说。', effect: { affinity: 8, learning: 11, mental: 10 } },
        { text: '她说：“不急。”', effect: { affinity: 7, learning: 11, mental: 10 } },
        { text: '你和她聊天会变安静。', effect: { affinity: 8, learning: 10, mental: 11 } },
        { text: '像被温柔对待。', effect: { affinity: 9, learning: 10, mental: 12 } },
      ],
    },
  },
  }
]
