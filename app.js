/* ============================================================
   高中模拟器 — 核心逻辑 v2
   纯前端 SPA，localStorage 存档
   ============================================================ */

// ─── 常量 ───────────────────────────────────────────────────

const TOTAL_MONTHS = 34

// 中国学期月份映射（从9月开始）
const MONTH_MAP = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8]

const DEFAULT_PLAYER = {
  month: 1,
  health: 80,
  mental: 70,
  effort: 60,
  learning: 50,
  monthStarted: false,
  studyCount: 0,
  energy: 5,
  maxEnergy: 5,
  subjectHistory: [],
  pendingBias: null,
  examHistory: [],
  currentEvent: null,
  currentChoiceEvent: null,
  choiceEventDone: false,
  choiceEventChosen: null,
}

const DEFAULT_RELATIONS = {
  teachers: [
    {
      id: 'li', name: '李老师', subject: '数学', trait: '严格', affinity: 50, emoji: '👨‍🏫',
      desc: '教数学二十年，出了名的严格，但对认真求学的学生格外关照。',
      bonded: false,
      specialEvent: '毕业前，李老师特意把他珍藏多年的解题笔记悄悄塞给了你，扉页上写着"好好考"。',
      specialReward: { learning: 15, effort: 8 },
    },
    {
      id: 'zhang', name: '张老师', subject: '英语', trait: '温和', affinity: 48, emoji: '👩‍🏫',
      desc: '总是面带微笑，会在课后留下来帮同学答疑，课堂气氛很好，大家都喜欢她。',
      bonded: false,
      specialEvent: '张老师推荐你参加校英语演讲比赛，并亲手写了一封热情洋溢的推荐信交给你。',
      specialReward: { mental: 12, learning: 10 },
    },
  ],
  classmates: [
    {
      id: 'wang', name: '小王', trait: '活泼', affinity: 62, emoji: '😄',
      desc: '班里的开心果，总能在最难熬的备考期带来欢笑，但有时会影响你学习。',
      bonded: false,
      specialEvent: '小王把他珍藏的笔记本送给了你，扉页上写着"好兄弟，一起上大学！"。',
      specialReward: { mental: 15, health: 8 },
    },
    {
      id: 'li_s', name: '小李', trait: '内向', affinity: 40, emoji: '🤓',
      desc: '成绩稳居全班前三，平时话不多，但愿意和你分享学习心得。',
      bonded: false,
      specialEvent: '小李把自己三年整理的错题本悄悄放在你桌上，附了一张便条："别辜负自己，加油。"',
      specialReward: { learning: 18, effort: 6 },
    },
  ],
}

const EVENTS = [
  { text: '老师宣布下周有数学小测，同学们面面相觑，班里气氛一下子紧张起来。', effect: { effort: 5, mental: -3 }, affinityEffect: { id: 'li', delta: 3 } },
  { text: '学校举行秋季运动会，你报名了800米跑，赛场上风吹过来很舒服。', effect: { health: 8, mental: 5 }, affinityEffect: { group: 'classmates', delta: 4 } },
  { text: '期末将近，图书馆座位一位难求，走廊里也有人在背单词。', effect: { effort: 7, mental: -4 } },
  { text: '这周作业特别多，你连续三天熬夜到十二点，眼睛有些发酸。', effect: { health: -6, learning: 4 } },
  { text: '好天气，午休时你和几个同学跑去操场踢毽子，心情舒畅。', effect: { mental: 6, health: 3 }, affinityEffect: { group: 'classmates', delta: 3 } },
  { text: '班主任找你单独谈话，说最近状态不错，让你继续加油。', effect: { mental: 8, effort: 5 }, affinityEffect: { group: 'teachers', delta: 4 } },
  { text: '食堂新出了红烧肉，同学们排起了长队，今天的午饭格外香。', effect: { health: 4, mental: 3 } },
  { text: '一道压轴数学题困扰了你整整三天，凌晨突然想通，兴奋得睡不着。', effect: { learning: 6, mental: 4, effort: 3 }, affinityEffect: { id: 'li', delta: 5 } },
  { text: '和同桌因为借橡皮的小事起了摩擦，课间两人都没说话，有点别扭。', effect: { mental: -6, effort: -2 }, affinityEffect: { group: 'classmates', delta: -3 } },
  { text: '图书馆里发现一本讲相对论的课外书，读了半本，感觉世界开阔了。', effect: { mental: 5, learning: 3 } },
  { text: '月考前你紧张得在床上辗转反侧，脑子里把错题又过了一遍。', effect: { mental: -7, health: -4, effort: 4 } },
  { text: '周末被安排补课，少了两天休息，但把薄弱知识点补上了一些。', effect: { health: -5, mental: -4, learning: 5 }, affinityEffect: { id: 'zhang', delta: 3 } },
  { text: '物理老师课上讲了一道有趣的思维题，你第一个举手答对，全班鼓掌。', effect: { mental: 6, effort: 4, learning: 2 }, affinityEffect: { group: 'teachers', delta: 3 } },
  { text: '下雨天，教室里很安静，同学们都在埋头自习，气氛意外地专注。', effect: { effort: 5, learning: 3 } },
  { text: '期中成绩出来了，比上次进步了不少，妈妈打来电话说晚上吃你喜欢的菜。', effect: { mental: 9, health: 3, effort: 3 }, affinityEffect: { group: 'teachers', delta: 5 } },
]

const CHOICE_EVENTS = [
  {
    text: '班里正在组织学习小组，老师推荐你参加，但每周两次会占用自习时间。',
    choices: [
      { label: '🤝 加入小组', desc: '和同学互帮互助，互相讲解难题，进步不少，但少了独自钻研的时间。', effect: { learning: 8, mental: 5, effort: -3 } },
      { label: '📖 独自学习', desc: '按自己的节奏刷题，效率不错，但错过了合作的乐趣。', effect: { learning: 4, effort: 7, mental: -2 } },
    ]
  },
  {
    text: '周末同学邀请你一起出去爬山，但你还有一堆题没做完。',
    choices: [
      { label: '🏔️ 去爬山', desc: '爬山回来神清气爽，压力小了很多，不过作业还是得抽空补回来。', effect: { health: 8, mental: 7, effort: -4 } },
      { label: '📚 留家自习', desc: '把堆积的题目清掉大半，虽然有点闷，但心里踏实多了。', effect: { learning: 6, effort: 5, mental: -3 } },
    ]
  },
  {
    text: '文艺委员找你参加校合唱团，每周排练三次，会发一件帅气的演出服。',
    choices: [
      { label: '🎵 加入合唱团', desc: '排练很累，但站在舞台上的感觉超级棒，还认识了很多新朋友。', effect: { mental: 9, health: 3, effort: -5 } },
      { label: '🙅 婉拒邀请', desc: '婉拒了邀请，把省下来的时间用在了刷题上，效率不错。', effect: { effort: 5, learning: 3 } },
    ]
  },
  {
    text: '图书馆偶然发现一本跟高考毫无关系的有趣小说，你心动了。',
    choices: [
      { label: '📖 借回去读', desc: '废寝忘食地看完了，意境深远，感觉人生观都开阔了不少。', effect: { mental: 8, learning: -2, health: -3 } },
      { label: '😤 放回书架', desc: '忍住了诱惑，把时间用在课本上，学习进度明显加快。', effect: { effort: 6, learning: 4 } },
    ]
  },
  {
    text: '期末前一周，同学找你一起通宵刷题，说"一起卷才有动力"。',
    choices: [
      { label: '🌙 一起通宵', desc: '熬了两个通宵，题做了不少，但精神状态很差，上课有些恍惚。', effect: { learning: 9, effort: 5, health: -8, mental: -5 } },
      { label: '🛌 早睡保状态', desc: '拒绝通宵，好好睡觉，考场上头脑清醒，发挥更加稳定。', effect: { health: 6, mental: 4, learning: 3 } },
    ]
  },
  {
    text: '体育老师说下月有全校运动会，问你要不要代表班级参加800米。',
    choices: [
      { label: '🏃 参加比赛', desc: '拼命练习，最终跑出好成绩，全班给你加油，超级开心！', effect: { health: 10, mental: 8, effort: -3, learning: -2 } },
      { label: '📐 专注学习', desc: '婉拒了，把时间留给物理压轴题，虽然有点遗憾，但考试还行。', effect: { learning: 6, effort: 4 } },
    ]
  },
  {
    text: '语文老师问你愿不愿意上台展示作文，这是一次公开课。',
    choices: [
      { label: '🎤 上台展示', desc: '有点紧张，但获得了很多掌声，老师课后专门分享了写作技巧。', effect: { mental: 7, learning: 5, effort: 3 } },
      { label: '😳 婉拒上台', desc: '默默坐在台下听别人的，感觉有点可惜，但没有额外压力。', effect: { mental: -2 } },
    ]
  },
  {
    text: '发现同桌每次考试都比你高20分，你在考虑要不要主动请教学习方法。',
    choices: [
      { label: '💬 主动交流', desc: '鼓起勇气去交流，对方分享了不少好方法，受益匪浅。', effect: { learning: 7, mental: 5, effort: 4 } },
      { label: '💪 自己摸索', desc: '觉得方法靠自己，埋头苦干，虽然慢一些，但更有成就感。', effect: { effort: 8, learning: 3 } },
    ]
  },
  {
    text: '学生会在招募新成员，说可以锻炼能力和拓展人脉，但工作量不小。',
    choices: [
      { label: '🌟 加入学生会', desc: '忙得不可开交，但认识了很多有意思的人，人际关系大幅提升。', effect: { mental: 6, effort: -4, health: -3 } },
      { label: '📝 专注课业', desc: '婉拒了，把时间留给学习，期中成绩明显提高了不少。', effect: { learning: 7, effort: 5 } },
    ]
  },
  {
    text: '班主任希望你帮成绩落后的同学补课，说这对你们俩都有好处。',
    choices: [
      { label: '🙋 答应帮忙', desc: '帮他讲题时自己也梳理了一遍知识点，意外地收获很大。', effect: { learning: 6, mental: 5, effort: -2 } },
      { label: '🤷 婉言推辞', desc: '以自己也很忙为由拒绝了，专注刷了一套真题。', effect: { learning: 5, effort: 4 } },
    ]
  },
  {
    text: '数学老师出了一道超纲的竞赛加分题，你要不要挑战一下？',
    choices: [
      { label: '🧮 挑战加分题', desc: '死磕了三小时，最终做出来了！得到老师表扬，超有成就感。', effect: { learning: 10, effort: 5, health: -4, mental: 5 } },
      { label: '✅ 做好基础题', desc: '把稳定分数的基础题做扎实，发挥稳定，拿到该得的分数。', effect: { learning: 5, effort: 4 } },
    ]
  },
  {
    text: '班里流行起了一款新手游，课间很多人在玩，你要不要也试试？',
    choices: [
      { label: '🎮 下载来玩', desc: '沉迷了一段时间，成绩有点下滑，但和同学的共同话题多了不少。', effect: { mental: 7, effort: -5, learning: -3, health: -2 } },
      { label: '🚫 保持自制', desc: '坚持没下载，把课间时间用来背单词，词汇量明显提升。', effect: { effort: 7, learning: 5 } },
    ]
  },
  {
    text: '家长建议报一个线上补习班，每周三晚上上课，你觉得自习效果也还不错。',
    choices: [
      { label: '📺 报名补习', desc: '老师讲得很系统，物理解题思路尤其清晰，进步不少。', effect: { learning: 9, effort: 3, mental: -2, health: -3 } },
      { label: '🔇 自主复习', desc: '按自己的计划来，把整理的错题本全部过了一遍，效果还行。', effect: { learning: 6, effort: 6 } },
    ]
  },
  {
    text: '好朋友遇到了感情烦恼，拉着你倾诉了整整一个下午，耽误了不少时间。',
    choices: [
      { label: '❤️ 好好陪伴', desc: '认真倾听和开导，好友感激不已，你们的感情更深了。', effect: { mental: 6, effort: -4 } },
      { label: '📋 委婉提前离', desc: '安慰了一会儿后，以有作业为由先走，内心有点愧疚。', effect: { learning: 4, mental: -3 } },
    ]
  },
  {
    text: '班里传阅一份高考志愿参考表，你注意到一所顶尖大学，开始认真规划目标。',
    choices: [
      { label: '🎯 定高目标', desc: '给自己定了一个很有挑战性的目标，干劲十足，但也有点焦虑。', effect: { effort: 8, learning: 5, mental: -4 } },
      { label: '📊 稳步前进', desc: '定了一个踏实可达的目标，心态平稳，每天按计划推进。', effect: { effort: 5, learning: 4, mental: 3 } },
    ]
  },
]

const INTERACT_OPTS = {
  ask:     { label: '请教问题', desc: '请教了一道难题，老师讲解得很耐心，感觉豁然开朗。',                          eff: { learning: 4, mental: 2 },  aff: 5 },
  greet:   { label: '礼貌问好', desc: '走廊里遇到，礼貌地打了招呼，老师微笑点头。',                                eff: { mental: 2 },               aff: 3 },
  consult: { label: '寻求建议', desc: '和老师聊了聊对未来的规划，老师给了一些非常实用的建议，很受用。',            eff: { mental: 5, effort: 3 },    aff: 6 },
  praise:  { label: '表达感谢', desc: '真诚地向老师表达了感谢，老师有些意外，但显得很高兴。',                      eff: { mental: 3 },               aff: 4 },
  play:    { label: '一起玩耍', desc: '课间一起打乒乓球，赢了两局，笑得很开心。',                                   eff: { mental: 5, health: 2 },    aff: 6 },
  study:   { label: '互相学习', desc: '放学后一起在图书馆刷题，互相讲解错题，效率挺高的。',                         eff: { learning: 3, effort: 3 },  aff: 4 },
  chat:    { label: '闲聊吐槽', desc: '课间聊了聊各科的压力和最近的烦恼，互相吐槽，感觉轻松了很多。',              eff: { mental: 6 },               aff: 5 },
  help:    { label: '主动帮忙', desc: '主动帮对方解答了一道卡了很久的题，对方感激地说了声谢谢，心情很好。',         eff: { learning: 2, mental: 4 },  aff: 7 },
}

const SUBJECTS = ['数学','语文','英语','物理','化学','生物','历史','地理','政治']

const QUIZ_BANK = {
  '数学': [
    { q: '若 f(x) = x² + 2x + 1，则 f(2) = ?', opts: ['A. 7', 'B. 9', 'C. 8', 'D. 6'], ans: 1 },
    { q: '1 + 2 + 3 + … + 100 的值为？', opts: ['A. 4950', 'B. 5000', 'C. 5050', 'D. 5100'], ans: 2 },
    { q: '下列哪个函数是奇函数？', opts: ['A. y = x²', 'B. y = x³', 'C. y = |x|', 'D. y = x² + 1'], ans: 1 },
    { q: '直线 y = 2x + 3 的斜率是？', opts: ['A. 3', 'B. 2', 'C. −2', 'D. ½'], ans: 1 },
    { q: 'sin 30° 的值是？', opts: ['A. √3/2', 'B. 1/2', 'C. √2/2', 'D. 1'], ans: 1 },
    { q: '等差数列 2, 5, 8, … 的公差是？', opts: ['A. 2', 'B. 3', 'C. 4', 'D. 5'], ans: 1 },
    { q: '圆的面积公式是？', opts: ['A. πr', 'B. 2πr', 'C. πr²', 'D. 2πr²'], ans: 2 },
    { q: 'log₂ 8 = ?', opts: ['A. 2', 'B. 3', 'C. 4', 'D. 6'], ans: 1 },
    { q: '函数 y = sin x 的最大值是？', opts: ['A. 0', 'B. π', 'C. 1', 'D. 2'], ans: 2 },
    { q: '(a + b)² 展开等于？', opts: ['A. a² + b²', 'B. a² + ab + b²', 'C. a² + 2ab + b²', 'D. 2a² + 2b²'], ans: 2 },
  ],
  '语文': [
    { q: '《红楼梦》的作者是？', opts: ['A. 施耐庵', 'B. 罗贯中', 'C. 曹雪芹', 'D. 吴承恩'], ans: 2 },
    { q: '"春眠不觉晓，处处闻啼鸟"出自哪位诗人？', opts: ['A. 李白', 'B. 杜甫', 'C. 孟浩然', 'D. 王维'], ans: 2 },
    { q: '"先天下之忧而忧"出自哪篇名文？', opts: ['A. 《出师表》', 'B. 《岳阳楼记》', 'C. 《醉翁亭记》', 'D. 《桃花源记》'], ans: 1 },
    { q: '下列词语中没有错别字的是？', opts: ['A. 迫不急待', 'B. 再接再励', 'C. 相辅相成', 'D. 出奇至胜'], ans: 2 },
    { q: '"知之为知之，不知为不知"出自？', opts: ['A. 《庄子》', 'B. 《论语》', 'C. 《孟子》', 'D. 《大学》'], ans: 1 },
    { q: '下列句子没有语病的是？', opts: ['A. 他的意见基本上完全正确', 'B. 我们要防止不发生类似事故', 'C. 这本书的内容丰富多彩', 'D. 他非常地十分喜欢读书'], ans: 2 },
    { q: '《离骚》的作者是？', opts: ['A. 屈原', 'B. 杜甫', 'C. 李白', 'D. 苏轼'], ans: 0 },
    { q: '"举头望明月，低头思故乡"出自哪首诗？', opts: ['A. 《静夜思》', 'B. 《望庐山瀑布》', 'C. 《将进酒》', 'D. 《春晓》'], ans: 0 },
    { q: '"烽火连三月，家书抵万金"出自杜甫的？', opts: ['A. 《望岳》', 'B. 《春望》', 'C. 《茅屋为秋风所破歌》', 'D. 《登高》'], ans: 1 },
    { q: '《水浒传》中"及时雨"指的是？', opts: ['A. 武松', 'B. 林冲', 'C. 宋江', 'D. 鲁智深'], ans: 2 },
  ],
  '英语': [
    { q: '"I have been studying for 3 hours." 用的是什么时态？', opts: ['A. 一般过去时', 'B. 过去进行时', 'C. 现在完成进行时', 'D. 将来完成时'], ans: 2 },
    { q: 'The synonym of "happy" is?', opts: ['A. sad', 'B. angry', 'C. joyful', 'D. tired'], ans: 2 },
    { q: '"She ___ to school every day." 空格处应填？', opts: ['A. go', 'B. goes', 'C. going', 'D. gone'], ans: 1 },
    { q: '"I ___ my homework before dinner." 空格处应填？', opts: ['A. finish', 'B. finished', 'C. had finished', 'D. will finish'], ans: 2 },
    { q: 'Which word means "important"?', opts: ['A. trivial', 'B. crucial', 'C. minor', 'D. slight'], ans: 1 },
    { q: 'The antonym of "difficult" is?', opts: ['A. easy', 'B. hard', 'C. tough', 'D. complex'], ans: 0 },
    { q: '"She is taller ___ her sister." 空格处应填？', opts: ['A. than', 'B. then', 'C. as', 'D. of'], ans: 0 },
    { q: 'Which is the correct plural of "child"?', opts: ['A. childs', 'B. childes', 'C. children', 'D. child'], ans: 2 },
    { q: '"I ___ to Beijing last year." 空格处应填？', opts: ['A. go', 'B. goes', 'C. going', 'D. went'], ans: 3 },
    { q: 'The word "enormous" means?', opts: ['A. tiny', 'B. average', 'C. huge', 'D. narrow'], ans: 2 },
  ],
  '物理': [
    { q: '牛顿第一定律又称为什么？', opts: ['A. 能量守恒定律', 'B. 万有引力定律', 'C. 惯性定律', 'D. 胡克定律'], ans: 2 },
    { q: '重力加速度 g 的通常取值约为？', opts: ['A. 10 m/s²', 'B. 9.8 m/s²', 'C. 8 m/s²', 'D. 1 m/s²'], ans: 1 },
    { q: '光在真空中的速度约为？', opts: ['A. 3×10⁶ m/s', 'B. 3×10⁸ m/s', 'C. 3×10¹⁰ m/s', 'D. 3×10⁴ m/s'], ans: 1 },
    { q: '声音不能在以下哪种介质中传播？', opts: ['A. 空气', 'B. 水', 'C. 钢铁', 'D. 真空'], ans: 3 },
    { q: '电流 I=2A，电压 U=10V，则功率 P = ?', opts: ['A. 5 W', 'B. 12 W', 'C. 20 W', 'D. 8 W'], ans: 2 },
    { q: '以下哪种波不是机械波？', opts: ['A. 声波', 'B. 水波', 'C. 光波', 'D. 地震波'], ans: 2 },
    { q: '物体做匀速直线运动，合力情况是？', opts: ['A. 合力不为零', 'B. 合力为零', 'C. 不受任何力', 'D. 只受重力'], ans: 1 },
    { q: '"焦耳（J）"是哪个物理量的单位？', opts: ['A. 力', 'B. 功或能量', 'C. 速度', 'D. 加速度'], ans: 1 },
    { q: '凸透镜对光线的作用是？', opts: ['A. 发散', 'B. 完全反射', 'C. 会聚', 'D. 不改变方向'], ans: 2 },
    { q: '汽车刹车后乘客向前倾，原因是？', opts: ['A. 受到向前的力', 'B. 惯性', 'C. 摩擦力消失', 'D. 重力变大'], ans: 1 },
  ],
  '化学': [
    { q: '水的化学式是？', opts: ['A. H₂O₂', 'B. CO₂', 'C. H₂O', 'D. HO'], ans: 2 },
    { q: '元素周期表中原子序数最小的元素是？', opts: ['A. 氦', 'B. 锂', 'C. 氢', 'D. 碳'], ans: 2 },
    { q: '下列哪种物质是氧化物？', opts: ['A. NaCl', 'B. H₂O', 'C. O₂', 'D. NaOH'], ans: 1 },
    { q: '酸的 pH 值范围是？', opts: ['A. pH = 7', 'B. pH > 7', 'C. pH < 7', 'D. 任意值'], ans: 2 },
    { q: '铁的化学符号是？', opts: ['A. Al', 'B. Fe', 'C. Cu', 'D. Ag'], ans: 1 },
    { q: '下列哪种变化是化学变化？', opts: ['A. 水蒸发', 'B. 铁生锈', 'C. 冰融化', 'D. 玻璃破碎'], ans: 1 },
    { q: '碳酸钙（CaCO₃）的俗名是？', opts: ['A. 食盐', 'B. 纯碱', 'C. 石灰石', 'D. 烧碱'], ans: 2 },
    { q: '中性原子中，核外电子数等于？', opts: ['A. 中子数', 'B. 质量数', 'C. 质子数', 'D. 质量数的一半'], ans: 2 },
    { q: '有机物中一定含有的元素是？', opts: ['A. 氧', 'B. 氮', 'C. 碳', 'D. 氢'], ans: 2 },
    { q: '金刚石与石墨物理性质差异大，原因是？', opts: ['A. 碳原子个数不同', 'B. 碳原子排列方式不同', 'C. 相对原子质量不同', 'D. 化学性质不同'], ans: 1 },
  ],
  '生物': [
    { q: '细胞的"控制中心"是？', opts: ['A. 线粒体', 'B. 核糖体', 'C. 细胞核', 'D. 细胞膜'], ans: 2 },
    { q: '植物光合作用的场所是？', opts: ['A. 线粒体', 'B. 叶绿体', 'C. 核糖体', 'D. 高尔基体'], ans: 1 },
    { q: 'DNA 的全称是？', opts: ['A. 核糖核酸', 'B. 脱氧核糖核酸', 'C. 氨基酸链', 'D. 多糖'], ans: 1 },
    { q: '人体最大的器官是？', opts: ['A. 肝脏', 'B. 肺', 'C. 皮肤', 'D. 心脏'], ans: 2 },
    { q: '人体能量的主要来源是？', opts: ['A. 蛋白质', 'B. 脂肪', 'C. 糖类', 'D. 维生素'], ans: 2 },
    { q: '遗传的基本单位是？', opts: ['A. 细胞', 'B. 染色体', 'C. 基因', 'D. DNA'], ans: 2 },
    { q: '植物细胞与动物细胞最主要的区别是植物细胞有？', opts: ['A. 核糖体', 'B. 细胞核', 'C. 细胞壁和叶绿体', 'D. 线粒体'], ans: 2 },
    { q: '神经调节的基本单位是？', opts: ['A. 脑', 'B. 脊髓', 'C. 突触', 'D. 神经元'], ans: 3 },
    { q: '蛋白质的合成场所是？', opts: ['A. 线粒体', 'B. 细胞核', 'C. 核糖体', 'D. 叶绿体'], ans: 2 },
    { q: '有丝分裂的意义是？', opts: ['A. 减少染色体数目', 'B. 产生配子', 'C. 保持亲子代染色体数目不变', 'D. 促进基因突变'], ans: 2 },
  ],
  '历史': [
    { q: '中国历史上第一个王朝是？', opts: ['A. 商', 'B. 夏', 'C. 周', 'D. 秦'], ans: 1 },
    { q: '秦始皇统一六国的年份是？', opts: ['A. 公元前481年', 'B. 公元前221年', 'C. 公元前206年', 'D. 公元前100年'], ans: 1 },
    { q: '"仁"是哪位思想家的核心主张？', opts: ['A. 老子', 'B. 孟子', 'C. 孔子', 'D. 墨子'], ans: 2 },
    { q: '古代丝绸之路的起点城市是？', opts: ['A. 南京', 'B. 洛阳', 'C. 长安（西安）', 'D. 北京'], ans: 2 },
    { q: '中国四大发明不包括？', opts: ['A. 火药', 'B. 指南针', 'C. 望远镜', 'D. 印刷术'], ans: 2 },
    { q: '鸦片战争爆发于哪一年？', opts: ['A. 1800年', 'B. 1840年', 'C. 1900年', 'D. 1860年'], ans: 1 },
    { q: '"五四运动"发生于哪一年？', opts: ['A. 1911年', 'B. 1919年', 'C. 1921年', 'D. 1927年'], ans: 1 },
    { q: '中华人民共和国成立于？', opts: ['A. 1945年', 'B. 1949年', 'C. 1950年', 'D. 1956年'], ans: 1 },
    { q: '法国大革命爆发于哪一年？', opts: ['A. 1776年', 'B. 1789年', 'C. 1800年', 'D. 1815年'], ans: 1 },
    { q: '"贞观之治"是哪位皇帝在位时期的盛世？', opts: ['A. 汉武帝', 'B. 唐太宗', 'C. 宋太祖', 'D. 明成祖'], ans: 1 },
  ],
  '地理': [
    { q: '世界上面积最大的洲是？', opts: ['A. 非洲', 'B. 北美洲', 'C. 亚洲', 'D. 南极洲'], ans: 2 },
    { q: '被称为中国"母亲河"的是？', opts: ['A. 长江', 'B. 黄河', 'C. 珠江', 'D. 淮河'], ans: 1 },
    { q: '地球自转的方向是？', opts: ['A. 自东向西', 'B. 自西向东', 'C. 自南向北', 'D. 自北向南'], ans: 1 },
    { q: '北极圈以内地区在夏至日会出现？', opts: ['A. 极夜', 'B. 极昼', 'C. 日食', 'D. 月食'], ans: 1 },
    { q: '世界上最长的河流是？', opts: ['A. 亚马孙河', 'B. 长江', 'C. 密西西比河', 'D. 尼罗河'], ans: 3 },
    { q: '我国地势总体特征是？', opts: ['A. 东高西低', 'B. 西高东低', 'C. 南高北低', 'D. 四周高中间低'], ans: 1 },
    { q: '以下哪个城市是中国的直辖市？', opts: ['A. 广州', 'B. 成都', 'C. 重庆', 'D. 武汉'], ans: 2 },
    { q: '季风气候主要受什么影响？', opts: ['A. 洋流', 'B. 地形阻隔', 'C. 海陆热力差异', 'D. 纬度位置'], ans: 2 },
    { q: '煤、石油、天然气都属于？', opts: ['A. 可再生能源', 'B. 化石燃料', 'C. 新能源', 'D. 核能'], ans: 1 },
    { q: '地球上最大的大洋是？', opts: ['A. 大西洋', 'B. 印度洋', 'C. 太平洋', 'D. 北冰洋'], ans: 2 },
  ],
  '政治': [
    { q: '在政治经济学中，商品价格的决定因素是？', opts: ['A. 供求关系', 'B. 商品的价值', 'C. 政府规定', 'D. 生产成本'], ans: 1 },
    { q: '下列说法符合唯物主义观点的是？', opts: ['A. 物质由意识决定', 'B. 意识是第一性的', 'C. 物质是客观存在的', 'D. 神创造了世界'], ans: 2 },
    { q: '商品的两个基本属性是？', opts: ['A. 价格和价值', 'B. 使用价值和价值', 'C. 质量和数量', 'D. 供给和需求'], ans: 1 },
    { q: '"冰冻三尺非一日之寒"体现了哪个哲学原理？', opts: ['A. 对立统一', 'B. 量变引起质变', 'C. 事物是运动的', 'D. 矛盾的普遍性'], ans: 1 },
    { q: '市场经济中，资源配置的主要手段是？', opts: ['A. 政府计划', 'B. 行政命令', 'C. 价格机制', 'D. 道德约束'], ans: 2 },
    { q: '事物之间的联系是？', opts: ['A. 任意的', 'B. 主观创造的', 'C. 客观的、有条件的', 'D. 绝对不变的'], ans: 2 },
    { q: '通货膨胀时，货币的购买力会？', opts: ['A. 上升', 'B. 不变', 'C. 下降', 'D. 先升后降'], ans: 2 },
    { q: '哲学中"矛盾"是指？', opts: ['A. 战争冲突', 'B. 思维混乱', 'C. 观点对立', 'D. 事物内部或事物之间的对立统一关系'], ans: 3 },
    { q: 'GDP 是指？', opts: ['A. 国内生产总值', 'B. 国民总收入', 'C. 居民消费价格指数', 'D. 外汇储备总量'], ans: 0 },
    { q: '"实践出真知"说明？', opts: ['A. 实践和认识无关', 'B. 认识决定实践', 'C. 实践是认识的基础和来源', 'D. 只有实践没有认识'], ans: 2 },
  ],
}

// ─── 运行时状态 ─────────────────────────────────────────────

let player    = {}
let relations = {}
let currentPage = 'home'
let currentQuiz = null
let currentSocialTab = 'teachers'

// ─── 初始化 ─────────────────────────────────────────────────

function init() {
  loadState()
  // 如果是全新游戏或月份未开始，自动进入当月
  if (!player.monthStarted && player.month <= TOTAL_MONTHS) {
    autoStartMonth()
  }
  renderStatusBar()
  renderEnergyBar()
  switchPage('home')
}

// ─── 存档 ───────────────────────────────────────────────────

function loadState() {
  try {
    const sp = localStorage.getItem('hs_player')
    player = sp ? { ...DEFAULT_PLAYER, ...JSON.parse(sp) } : { ...DEFAULT_PLAYER }
  } catch { player = { ...DEFAULT_PLAYER } }

  try {
    const sr = localStorage.getItem('hs_relations')
    if (sr) {
      const loaded = JSON.parse(sr)
      // 用默认值作为基础，合并已存档的运行时数据（affinity、bonded等）
      const merge = (defs, saved) => defs.map(def => {
        const ex = saved.find(p => p.id === def.id)
        return ex ? { ...def, ...ex } : { ...def }
      })
      relations = {
        teachers:   merge(DEFAULT_RELATIONS.teachers,   loaded.teachers   || []),
        classmates: merge(DEFAULT_RELATIONS.classmates, loaded.classmates || []),
      }
    } else {
      relations = deepClone(DEFAULT_RELATIONS)
    }
  } catch { relations = deepClone(DEFAULT_RELATIONS) }
}

function saveState() {
  localStorage.setItem('hs_player', JSON.stringify(player))
  localStorage.setItem('hs_relations', JSON.stringify(relations))
}

// ─── 月份工具 ────────────────────────────────────────────────

function getMonthInfo(month) {
  const m = Math.min(Math.max(1, month), TOTAL_MONTHS)
  const grade = m <= 12 ? '高一' : m <= 24 ? '高二' : '高三'
  const offset = (m - 1) % 12
  const actualMonth = MONTH_MAP[offset]
  // 9-1月为上学期(offset 0-4)，2-6月为下学期(offset 5-9)，7-8月为暑假(offset 10-11)
  const semester = offset <= 4 ? '上学期' : offset <= 9 ? '下学期' : '暑假'
  return { grade, month: actualMonth, semester, seq: m }
}

function getGradeLabel(month) {
  const info = getMonthInfo(month)
  return `${info.grade} · ${info.semester}`
}

// 按月份轮换互动选项（老师/同学各4个，每月展示其中2个）
function getCharInteractions(type) {
  const teacherPool = ['ask', 'greet', 'consult', 'praise']
  const classPool   = ['play', 'study', 'chat', 'help']
  const pool  = type === 'teacher' ? teacherPool : classPool
  const start = (player.month - 1) % pool.length
  return [pool[start], pool[(start + 1) % pool.length]]
}

// 将事件的好感度涟漪效果应用到对应角色
function applyAffinityEffect(ae) {
  if (!ae) return
  const all = [...relations.teachers, ...relations.classmates]
  if (ae.id) {
    const p = all.find(x => x.id === ae.id)
    if (p) p.affinity = clamp(p.affinity + ae.delta)
  } else if (ae.group === 'teachers') {
    relations.teachers.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
  } else if (ae.group === 'classmates') {
    relations.classmates.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
  } else if (ae.group === 'all') {
    all.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
  }
  saveState()
}

// ─── 自动开月 ────────────────────────────────────────────────

function autoStartMonth() {
  if (!player.currentEvent) {
    player.currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)]
  }
  if (!player.currentChoiceEvent) {
    player.currentChoiceEvent = CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)]
    player.choiceEventDone = false
    player.choiceEventChosen = null
  }
  if (player.currentEvent?.effect) applyChanges(player.currentEvent.effect)
  if (player.currentEvent?.affinityEffect) applyAffinityEffect(player.currentEvent.affinityEffect)
  player.monthStarted = true
  player.studyCount = 0
  player.energy = player.maxEnergy ?? 5
  saveState()
  renderEnergyBar()
}

// ─── 状态栏 ─────────────────────────────────────────────────

function renderStatusBar() {
  const keys = ['health', 'mental', 'effort', 'learning']
  keys.forEach(k => {
    const v = clamp(player[k])
    const ring = document.getElementById(`ring-${k}`)
    if (ring) ring.style.strokeDasharray = `${v} 100`
    const num = document.getElementById(`num-${k}`)
    if (num) num.textContent = v
  })
}

function renderEnergyBar() {
  const max = player.maxEnergy ?? 5
  const cur = Math.max(0, player.energy ?? max)
  const dotsEl = document.getElementById('energy-dots')
  const countEl = document.getElementById('energy-count')
  if (!dotsEl) return
  dotsEl.innerHTML = Array.from({ length: max }, (_, i) =>
    `<div class="energy-dot ${i < cur ? 'full' : 'empty'}"></div>`
  ).join('')
  if (countEl) countEl.textContent = `${cur} / ${max}`
}

function useEnergy() {
  const cur = player.energy ?? 0
  if (cur <= 0) {
    showModal('<div class="modal-title">精力耗尽</div><p class="muted tc" style="padding:4px 0 8px">今天的精力已经用完了，<br>休息一下等待下个月吧。</p>')
    return false
  }
  player.energy = cur - 1
  saveState()
  renderEnergyBar()
  return true
}

function updateSubjectHistory(subject) {
  if (!player.subjectHistory) player.subjectHistory = []
  player.subjectHistory.push(subject)
  if (player.subjectHistory.length > 10) player.subjectHistory.shift()
  if (player.pendingBias) { saveState(); return }

  const hist = player.subjectHistory

  // 连续三次刷同一科目
  if (hist.length >= 3) {
    const tail = hist.slice(-3)
    if (tail.every(s => s === tail[0])) {
      player.pendingBias = {
        type: 'streak', subject: tail[0],
        message: `你已连续三次只刷 ${tail[0]}，知识结构严重失衡，学习进度将受影响！`,
      }
      saveState(); return
    }
  }

  // 连续五次未刷某一科目（该科目曾被刷过）
  if (hist.length >= 5) {
    const recent5 = hist.slice(-5)
    const allStudied = [...new Set(hist)]
    const neglected = allStudied.filter(s => !recent5.includes(s))
    if (neglected.length > 0) {
      player.pendingBias = {
        type: 'neglect', subject: neglected[0],
        message: `你已连续 5 次没有刷 ${neglected[0]} 题，知识点遗忘加速，学习进度将受影响！`,
      }
    }
  }
  saveState()
}

function getBiasWarnings() {
  const hist = player.subjectHistory || []
  if (player.pendingBias) return []
  const warnings = []

  // 即将连续三次（当前连续两次）
  if (hist.length >= 2 && hist[hist.length - 1] === hist[hist.length - 2]) {
    warnings.push(`⚠️ 已连续 2 次刷 ${hist[hist.length - 1]}，再刷同一科将触发偏科惩罚`)
  }

  // 即将连续五次未刷（当前连续四次未刷）
  if (hist.length >= 4) {
    const recent4 = hist.slice(-4)
    const allStudied = [...new Set(hist)]
    allStudied.filter(s => !recent4.includes(s)).slice(0, 2).forEach(s => {
      warnings.push(`⚠️ ${s} 已连续 4 次未刷，再不刷将触发偏科惩罚`)
    })
  }

  return warnings
}

function applyChanges(changes) {
  Object.entries(changes).forEach(([k, d]) => {
    if (k in player) player[k] = clamp(player[k] + d)
  })
  renderStatusBar()
  saveState()
}

// ─── 页面路由 ────────────────────────────────────────────────

function switchPage(page) {
  if (page !== 'study') currentQuiz = null
  currentPage = page
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === page)
  )
  const pages = { home: renderHome, social: renderSocial, study: renderStudy, fun: renderFun }
  document.getElementById('content').innerHTML = ''
  pages[page]?.()
}

// ─── 事件标签工具 ────────────────────────────────────────────

function getEventTags(effect) {
  const tagMap = {
    health:   { pos: '💪 体力充沛', neg: '😴 体力透支' },
    mental:   { pos: '😊 心情愉快', neg: '😰 压力倍增' },
    effort:   { pos: '📖 干劲十足', neg: '😩 状态低迷' },
    learning: { pos: '💡 学有所获', neg: '😅 学习受阻' },
  }
  return Object.entries(effect).map(([k, v]) => {
    const t = tagMap[k]
    if (!t) return null
    return { label: v > 0 ? t.pos : t.neg, positive: v > 0 }
  }).filter(Boolean)
}

function buildEventCard(ev) {
  const tags = getEventTags(ev.effect)
  const typeTagsHtml = tags.map(t =>
    `<span class="event-type-tag event-type-${t.positive ? 'pos' : 'neg'}">${t.label}</span>`
  ).join('')

  const effectTagsHtml = Object.entries(ev.effect).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
  }).join('')

  return `
    <div class="event-type-tags">${typeTagsHtml}</div>
    <div class="event-box">${ev.text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `
}

// ─── 选择型事件 ──────────────────────────────────────────────

function buildChoiceEventCard(ev) {
  if (!ev) return ''

  const done = player.choiceEventDone
  const chosen = player.choiceEventChosen

  const badgeHtml = done
    ? `<span class="choice-badge-done">✓ 已选择</span>`
    : `<span class="choice-badge-pending">⚡ 待选择</span>`

  const headerHtml = `
    <div class="choice-event-header">
      <span class="card-label" style="margin-bottom:0">本月抉择</span>
      ${badgeHtml}
    </div>
  `

  if (done && chosen !== null) {
    const c = ev.choices[chosen]
    const effectTagsHtml = Object.entries(c.effect).map(([k, v]) => {
      const label = STAT_LABELS[k] ?? k
      return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
    }).join('')
    return `
      ${headerHtml}
      <div class="choice-event-text">${ev.text}</div>
      <div class="choice-chosen-label">你选择了：${c.label}</div>
      <div class="choice-result-box">${c.desc}</div>
      <div class="effect-tags" style="margin-top:8px">${effectTagsHtml}</div>
    `
  }

  const btnsHtml = ev.choices.map((c, i) =>
    `<button class="choice-btn" onclick="handleChoice(${i})">${c.label}</button>`
  ).join('')

  return `
    ${headerHtml}
    <div class="choice-event-text">${ev.text}</div>
    <div class="choice-btns">${btnsHtml}</div>
  `
}

function handleChoice(index) {
  if (!player.currentChoiceEvent || player.choiceEventDone) return
  const choice = player.currentChoiceEvent.choices[index]
  if (!choice) return
  player.choiceEventDone = true
  player.choiceEventChosen = index
  saveState()
  applyChanges(choice.effect)
  renderHome()
}

// ─── 折线图 ──────────────────────────────────────────────────

function buildScoreChart(history) {
  const recent = history.slice(-10)
  if (recent.length === 0) return ''

  const W = 260, H = 88, PAD = 12
  const scores = recent.map(e => e.score)
  const minS = Math.max(0, Math.min(...scores) - 60)
  const maxS = Math.min(750, Math.max(...scores) + 60)
  const range = maxS - minS || 1

  const n = recent.length
  const getX = i => PAD + (n > 1 ? i * (W - PAD * 2) / (n - 1) : (W - PAD * 2) / 2)
  const getY = s => H - PAD - ((s - minS) / range) * (H - PAD * 2)

  const pts = recent.map((e, i) => ({
    x: getX(i), y: getY(e.score), score: e.score, month: e.month
  }))
  const polyPts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const fillPts = n > 1
    ? `${pts[0].x.toFixed(1)},${(H - PAD).toFixed(1)} ${polyPts} ${pts[n-1].x.toFixed(1)},${(H - PAD).toFixed(1)}`
    : ''

  const last = recent[n - 1]
  const prev = n > 1 ? recent[n - 2] : null
  const delta = prev ? last.score - prev.score : null

  const deltaHtml = delta !== null
    ? `<span class="score-delta ${delta >= 0 ? 'delta-pos' : 'delta-neg'}">${delta >= 0 ? '↑' : '↓'}${Math.abs(delta)}分</span>`
    : ''

  const dotsSvg = pts.map((p, i) => {
    const isLast = i === n - 1
    return isLast
      ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#4d9fd4" stroke="white" stroke-width="2"/>`
      : `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="#7bbde0"/>`
  }).join('')

  const labelsSvg = pts.map((p, i) => {
    const info = getMonthInfo(p.month)
    return `<text x="${p.x.toFixed(1)}" y="${H - 1}" text-anchor="middle" font-size="8" fill="#b8b3aa" font-family="inherit">${info.month}月</text>`
  }).join('')

  return `
    <div class="score-chart-header">
      <span class="score-current-val">${last.score}<span style="font-size:13px;font-weight:500;color:var(--text-muted)"> 分</span></span>
      ${deltaHtml}
    </div>
    <div class="score-chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;overflow:visible">
        <defs>
          <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#4d9fd4" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#4d9fd4" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${n > 1 ? `<polygon points="${fillPts}" fill="url(#cg)"/>` : ''}
        ${n > 1 ? `<polyline points="${polyPts}" fill="none" stroke="#4d9fd4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
        ${dotsSvg}
        ${labelsSvg}
      </svg>
    </div>
    <div class="score-chart-footer">
      <span class="muted" style="font-size:11px">共 ${n} 次月考 · 最高 ${Math.max(...scores)} 分</span>
    </div>
  `
}

// ─── 主控页面 ────────────────────────────────────────────────

function renderHome() {
  const c = document.getElementById('content')
  const done = player.month > TOTAL_MONTHS

  if (done) {
    c.innerHTML = renderGraduation()
    return
  }

  if (!player.currentEvent) {
    player.currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)]
    saveState()
  }

  const ev = player.currentEvent
  const monthNum = Math.min(player.month, TOTAL_MONTHS)
  const info = getMonthInfo(monthNum)
  const progress = Math.min(100, ((monthNum - 1) / TOTAL_MONTHS) * 100)

  const scoreHtml = player.examHistory.length > 0 ? `
    <div class="card">
      <div class="card-label">成绩趋势</div>
      ${buildScoreChart(player.examHistory)}
    </div>` : ''

  c.innerHTML = `
    <div class="card month-card">
      <div class="month-hero">
        <div class="month-semester-tag">📅 ${info.grade} · ${info.semester}</div>
        <div class="month-big">${info.month}月</div>
        <div class="month-seq">第 ${info.seq} 月 · 共 ${TOTAL_MONTHS} 月</div>
        <div class="month-progress-wrap">
          <div class="month-progress-fill" style="width:${progress.toFixed(1)}%"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-label">本月事件</div>
      ${buildEventCard(ev)}
    </div>

    ${player.currentChoiceEvent ? `
    <div class="card">
      ${buildChoiceEventCard(player.currentChoiceEvent)}
    </div>` : ''}

    <div class="card">
      <button class="btn btn-primary full-width btn-end-month" onclick="endMonth()">
        结束本月
      </button>
      <div class="end-month-hint">请在完成全部操作后结束本月</div>
    </div>

    ${scoreHtml}
  `
}

function renderGraduation() {
  const avg = player.examHistory.length
    ? Math.round(player.examHistory.reduce((s, e) => s + e.score, 0) / player.examHistory.length)
    : 0
  const best = player.examHistory.length
    ? Math.max(...player.examHistory.map(e => e.score))
    : 0

  return `
    <div class="card tc">
      <div class="graduation-icon">🎓</div>
      <div style="font-size:20px;font-weight:800;margin-bottom:6px;">高中生涯结束</div>
      <div class="muted">恭喜完成三年高中模拟！</div>
      <hr class="modal-divider mt12">
      <div class="info-row"><span class="muted">最终学习进度</span><span class="info-val">${player.learning}</span></div>
      <div class="info-row"><span class="muted">最终身体状态</span><span class="info-val">${player.health}</span></div>
      <div class="info-row"><span class="muted">参加月考次数</span><span class="info-val">${player.examHistory.length}</span></div>
      <div class="info-row"><span class="muted">最高单次分数</span><span class="info-val">${best}</span></div>
      <div class="info-row"><span class="muted">平均考试分数</span><span class="info-val">${avg}</span></div>
      <button class="btn btn-primary full-width mt12" onclick="resetGame()">重新开始</button>
    </div>
  `
}

function endMonth() {
  if (!player.monthStarted || player.month > TOTAL_MONTHS) return

  const currentMonth = player.month
  const score  = calcExamScore()
  const lgain  = clamp(Math.ceil(player.effort * 0.06 + player.learning * 0.04 + Math.random() * 4) - 2)
  const mgain  = player.studyCount >= 2 ? -1 : -4
  const efchg  = player.studyCount >= 1 ? 2 : -2
  const changes = { learning: lgain, mental: mgain, effort: efchg }

  player.examHistory.push({ month: currentMonth, score })
  applyChanges(changes)

  player.month++
  player.monthStarted = false
  player.currentEvent = null
  player.currentChoiceEvent = null
  player.choiceEventDone = false
  player.choiceEventChosen = null
  player.studyCount   = 0
  saveState()

  // 自动开始新月（包含新月事件效果）
  const isGameOver = player.month > TOTAL_MONTHS
  if (!isGameOver) {
    autoStartMonth()
  }

  const chgRows = Object.entries(changes).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k]}</span>
      <span class="${v >= 0 ? 'chg-pos' : 'chg-neg'}">${v >= 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  const info = getMonthInfo(currentMonth)

  showModal(`
    <div class="modal-title">${info.grade} ${info.month}月 · 月末结算</div>
    <div class="modal-row">
      <span>本月考试成绩</span>
      <span class="info-val">${score} / 750</span>
    </div>
    <hr class="modal-divider">
    ${chgRows}
  `, renderHome)
}

function calcExamScore() {
  const base = player.learning * 4.2 + player.effort * 1.5 + player.mental * 0.5
  const noise = (Math.random() * 80) - 40
  return Math.min(750, Math.max(0, Math.round(base + noise)))
}

function resetGame() {
  if (!confirm('确定要重新开始吗？所有进度将丢失。')) return
  player    = { ...DEFAULT_PLAYER }
  relations = deepClone(DEFAULT_RELATIONS)
  saveState()
  autoStartMonth()
  renderStatusBar()
  renderHome()
}

// ─── 人际页面 ────────────────────────────────────────────────

function switchSocialTab(tab) {
  currentSocialTab = tab
  renderSocial()
}

function renderSocial() {
  const c = document.getElementById('content')
  const isTeacher = currentSocialTab === 'teachers'
  const group = isTeacher ? relations.teachers : relations.classmates
  const type  = isTeacher ? 'teacher' : 'classmate'

  const bondedCount = (arr) => arr.filter(p => p.bonded).length

  c.innerHTML = `
    <div class="social-tabs">
      <button class="social-tab ${isTeacher ? 'active' : ''}" onclick="switchSocialTab('teachers')">
        👨‍🏫 老师
        ${bondedCount(relations.teachers) > 0 ? `<span class="tab-bond-dot"></span>` : ''}
      </button>
      <button class="social-tab ${!isTeacher ? 'active' : ''}" onclick="switchSocialTab('classmates')">
        👨‍🎓 同学
        ${bondedCount(relations.classmates) > 0 ? `<span class="tab-bond-dot"></span>` : ''}
      </button>
    </div>
    <div class="card">
      ${group.map(p => personCard(p, type)).join('')}
    </div>
  `
}

function personCard(p, type) {
  const actions = getCharInteractions(type)

  const affinityColor = p.bonded || p.affinity >= 100 ? '#c9952a'
                      : p.affinity >= 80 ? '#4caf72'
                      : p.affinity >= 60 ? '#4d9fd4'
                      : p.affinity >= 40 ? '#e09040'
                      : '#b8b3aa'

  const affinityLabel = p.bonded           ? '知己之交 ✨'
                      : p.affinity >= 80   ? '关系很好'
                      : p.affinity >= 60   ? '关系不错'
                      : p.affinity >= 40   ? '普通朋友'
                      : '不太熟悉'

  const sub = p.subject ? ` · ${p.subject}` : ''
  const bondedBadge = p.bonded ? `<span class="bonded-badge">✨ 知己</span>` : ''

  return `
    <div class="person-card-v2">
      <div class="pcard-top">
        <div class="person-avatar">${p.emoji}</div>
        <div class="person-info">
          <div class="person-name">
            ${p.name}
            <span class="person-tag">${p.trait}${sub}</span>
            ${bondedBadge}
          </div>
          ${p.desc ? `<div class="person-desc">${p.desc}</div>` : ''}
        </div>
      </div>
      <div class="pcard-affinity">
        <div class="affinity-label-row">
          <span class="affinity-status" style="color:${affinityColor}">${affinityLabel}</span>
          <span class="affinity-num">${p.affinity} / 100</span>
        </div>
        <div class="affinity-track-v2">
          <div class="affinity-fill-v2" style="width:${p.affinity}%;background:${affinityColor}"></div>
        </div>
        ${!p.bonded ? `<div class="affinity-milestones">
          <span class="mile ${p.affinity >= 40 ? 'reached' : ''}">40</span>
          <span class="mile ${p.affinity >= 60 ? 'reached' : ''}">60</span>
          <span class="mile ${p.affinity >= 80 ? 'reached' : ''}">80</span>
          <span class="mile ${p.affinity >= 100 ? 'reached' : ''}">✨</span>
        </div>` : ''}
      </div>
      <div class="pcard-actions">
        ${actions.map(a =>
          `<button class="btn btn-sm interact-btn" onclick="interact('${p.id}','${a}')">${INTERACT_OPTS[a].label}</button>`
        ).join('')}
      </div>
    </div>
  `
}

function interact(personId, action) {
  if (!player.monthStarted) {
    showModal('<div class="modal-title">提示</div><p class="muted">请先在主控面板开始本月。</p>')
    return
  }
  if (!useEnergy()) return

  const opt  = INTERACT_OPTS[action]
  const all  = [...relations.teachers, ...relations.classmates]
  const person = all.find(p => p.id === personId)
  if (!person) return

  person.affinity = clamp(person.affinity + opt.aff)
  const justBonded = !person.bonded && person.affinity >= 100
  if (justBonded) { person.bonded = true; person.affinity = 100 }
  applyChanges(opt.eff)
  saveState()

  const rows = Object.entries(opt.eff).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k]}</span>
      <span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  const afterInteract = () => {
    if (justBonded && person.specialEvent) {
      const rewardRows = Object.entries(person.specialReward || {}).map(([k, v]) =>
        `<div class="modal-row">
          <span>${STAT_LABELS[k]}</span>
          <span class="chg-pos">+${v}</span>
        </div>`
      ).join('')
      showModal(`
        <div class="bond-event-icon">${person.emoji}</div>
        <div class="modal-title">关系升华 ✨</div>
        <div class="event-box" style="font-size:13px;margin-bottom:12px;">${person.specialEvent}</div>
        <hr class="modal-divider">
        ${rewardRows}
      `, () => {
        if (person.specialReward) applyChanges(person.specialReward)
        renderSocial()
      })
    } else {
      renderSocial()
    }
  }

  showModal(`
    <div class="modal-title">互动结果</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${opt.desc}</div>
    <hr class="modal-divider">
    ${rows}
    <div class="modal-row">
      <span>与 ${person.name} 好感度</span>
      <span class="chg-pos">+${opt.aff}</span>
    </div>
  `, afterInteract)
}

// ─── 学习页面 ────────────────────────────────────────────────

function renderStudy() {
  const c = document.getElementById('content')

  if (!player.monthStarted) {
    c.innerHTML = `<div class="card tc" style="padding:30px 16px">
      <div class="muted">请先在主控面板开始本月</div>
    </div>`
    return
  }

  if (currentQuiz) { renderQuizActive(); return }

  const noEnergy = (player.energy ?? 0) <= 0
  const warnings = getBiasWarnings()

  const biasAlertHtml = player.pendingBias ? `
    <div class="bias-alert">
      <span class="bias-alert-icon">⚠️</span>
      <div class="bias-alert-body">
        <div class="bias-alert-title">偏科警告</div>
        <div class="bias-alert-msg">${player.pendingBias.message}</div>
        <div class="bias-alert-penalty">下次刷题将扣除学习进度 −10</div>
      </div>
    </div>` : ''

  const warningsHtml = warnings.length > 0 ? `
    <div class="bias-warn-box">
      ${warnings.map(w => `<div class="bias-warn-item">${w}</div>`).join('')}
    </div>` : ''

  c.innerHTML = `
    ${biasAlertHtml}
    ${warningsHtml}
    <div class="card">
      <div class="card-label">选择科目刷题</div>
      <div class="subject-row">
        ${SUBJECTS.map(s =>
          `<button class="subject-btn" onclick="startQuiz('${s}')"
            ${noEnergy ? 'disabled' : ''}>${s}</button>`
        ).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-label">本月情况</div>
      <div class="info-row">
        <span class="muted">已刷次数</span>
        <span class="info-val">${player.studyCount || 0} 次</span>
      </div>
    </div>

    <div class="card">
      <div class="card-label">规则说明</div>
      <div style="font-size:13px;color:var(--text-muted);line-height:2;font-weight:500;">
        · 每次刷题 5 道题，选择题单选<br>
        · 每次刷题消耗 1 点精力<br>
        · 答对越多，学习进度提升越多<br>
        · 连续刷同一科或长期不刷某科将触发偏科惩罚
      </div>
    </div>
  `
}

function startQuiz(subject) {
  if (!useEnergy()) return

  if (player.pendingBias) {
    const bias = player.pendingBias
    player.pendingBias = null
    saveState()
    applyChanges({ learning: -10 })
    showModal(`
      <div class="modal-title">⚠️ 偏科警告</div>
      <div class="event-box" style="font-size:13px;margin-bottom:12px;">${bias.message}</div>
      <hr class="modal-divider">
      <div class="modal-row"><span>学习进度</span><span class="chg-neg">−10</span></div>
    `, () => doStartQuiz(subject))
    return
  }

  doStartQuiz(subject)
}

function doStartQuiz(subject) {
  const bank = QUIZ_BANK[subject] || []
  const qs   = shuffle([...bank]).slice(0, 5)
  currentQuiz = { subject, questions: qs, current: 0, correct: 0, answered: false }
  renderQuizActive()
}

function renderQuizActive() {
  const c  = document.getElementById('content')
  const qz = currentQuiz

  if (qz.current >= qz.questions.length) {
    renderQuizResult()
    return
  }

  const q = qz.questions[qz.current]

  c.innerHTML = `
    <div class="card">
      <div class="quiz-header">
        <span class="quiz-subject-badge">${qz.subject}</span>
        <span class="quiz-counter">第 ${qz.current + 1} / ${qz.questions.length} 题</span>
      </div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((opt, i) =>
          `<button class="option-btn" id="opt-${i}" onclick="answerQuiz(${i})">${opt}</button>`
        ).join('')}
      </div>
    </div>
    <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:4px;font-weight:500;">
      已答对 ${qz.correct} 题
    </div>
  `
}

function answerQuiz(choice) {
  if (!currentQuiz || currentQuiz.answered) return
  currentQuiz.answered = true

  const q = currentQuiz.questions[currentQuiz.current]
  const ok = choice === q.ans
  if (ok) currentQuiz.correct++

  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true
    if (i === q.ans) btn.classList.add('correct')
    else if (i === choice && !ok) btn.classList.add('wrong')
  })

  setTimeout(() => {
    currentQuiz.current++
    currentQuiz.answered = false
    renderQuizActive()
  }, 900)
}

function renderQuizResult() {
  const c  = document.getElementById('content')
  const qz = currentQuiz
  const correct = qz.correct
  const total   = qz.questions.length

  const lgain = Math.ceil(correct * 1.8)
  const egain = correct >= 4 ? 3 : correct >= 2 ? 1 : -1

  const msg = correct === total ? '全对！太厉害了！'
            : correct >= 4     ? '做得不错！'
            : correct >= 2     ? '继续努力！'
            : '需要多加练习哦'

  c.innerHTML = `
    <div class="card tc">
      <div class="card-label">${qz.subject} 刷题结果</div>
      <div class="result-score">${correct} / ${total}</div>
      <div class="result-msg">${msg}</div>
    </div>
    <div class="card">
      <div class="card-label">属性变化</div>
      <div class="modal-row">
        <span>学习进度</span>
        <span class="chg-pos">+${lgain}</span>
      </div>
      <div class="modal-row">
        <span>努力程度</span>
        <span class="${egain > 0 ? 'chg-pos' : 'chg-neg'}">${egain > 0 ? '+' : ''}${egain}</span>
      </div>
    </div>
    <button class="btn btn-primary full-width" onclick="finishQuiz()">确认</button>
  `

  player.studyCount = (player.studyCount || 0) + 1
  updateSubjectHistory(qz.subject)
  applyChanges({ learning: lgain, effort: egain })
  currentQuiz = null
}

function finishQuiz() {
  renderStudy()
}

// ─── 娱乐页面 ────────────────────────────────────────────────

const GAMES = [
  { icon: '🏃', name: '跑步',   eff: '心理 + 身体', fn: 'startRunning()' },
  { icon: '🏀', name: '篮球',   eff: '身体 + 心理', fn: 'startBasketball()' },
  { icon: '🏊', name: '游泳',   eff: '身体 + 心理', fn: 'startSwimming()' },
  { icon: '🏓', name: '打砖块', eff: '心理 + 反应', fn: 'startBreakout()' },
  { icon: '✈️', name: '空战',   eff: '心理健康',   fn: 'startSkyFight()' },
]

function renderFun() {
  const c = document.getElementById('content')
  c.innerHTML = `
    <div class="card">
      <div class="card-label">选择活动</div>
      <div class="card-sub-label">运动可提升心理和身体健康，有时会遇到同学邀约</div>
      <div class="game-grid">
        ${GAMES.map(g => `
          <div class="game-card" onclick="${g.fn}">
            <div class="game-icon">${g.icon}</div>
            <div class="game-name">${g.name}</div>
            <div class="game-eff">${g.eff}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function showComingSoon(name) {
  showModal(`<div class="modal-title">${name}</div><p class="muted tc">正在开发中，敬请期待……</p>`)
}

function tryInvite(activityName, onDone) {
  if (!player.monthStarted || Math.random() >= 0.6 || relations.classmates.length === 0) {
    onDone(false); return
  }
  const person = relations.classmates[rndInt(relations.classmates.length)]

  window._acceptInvite = (personId) => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    const p = relations.classmates.find(c => c.id === personId)
    if (p) applyInviteOutcome(p, activityName, () => onDone(true))
    else onDone(false)
  }

  showModal(`
    <div class="modal-title">📣 同学邀约</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      ${person.emoji} <strong>${person.name}</strong> 刚好也想去${activityName}，要一起吗？<br>
      <span style="font-size:11px;color:var(--text-muted)">结果可能是好事，也可能起小摩擦……</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="closeModal()">独自进行</button>
      <button class="btn btn-primary full-width" onclick="_acceptInvite('${person.id}')">一起去！</button>
    </div>
  `, () => onDone(false), true)
}

function applyInviteOutcome(person, activityName, onDone) {
  const good   = Math.random() < 0.6
  const aff    = good ? (rndInt(6) + 4)  : -(rndInt(5) + 3)
  const mental = good ? (rndInt(4) + 4)  : -(rndInt(4) + 3)
  const health = good ? (rndInt(3) + 2)  : rndInt(2)

  const goodDescs = [
    `和 ${person.name} 一起去${activityName}超级开心，越运动越有默契，聊了好多心里话。`,
    `${person.name} 一路给你加油，你发挥得比平时好多了，心情大好！`,
    `一起${activityName}途中笑声不断，压力一扫而空，感觉整个人都轻松了。`,
  ]
  const badDescs = [
    `和 ${person.name} 去${activityName}途中意见不合，带着情绪回来，心情很差。`,
    `${person.name} 状态不好，负面情绪影响了你，这次${activityName}体验很差。`,
    `${person.name} 突然改变计划，让你觉得很扫兴，两人都有些别扭。`,
  ]
  const desc = good ? goodDescs[rndInt(goodDescs.length)] : badDescs[rndInt(badDescs.length)]

  person.affinity = clamp(person.affinity + aff)
  applyChanges({ mental, health })
  saveState()

  showModal(`
    <div class="modal-title">${good ? '活动顺利 🎉' : '小有不顺 😤'}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${desc}</div>
    <hr class="modal-divider">
    <div class="modal-row"><span>心理健康</span><span class="${mental >= 0 ? 'chg-pos' : 'chg-neg'}">${mental >= 0 ? '+' : ''}${mental}</span></div>
    <div class="modal-row"><span>身体健康</span><span class="${health > 0 ? 'chg-pos' : 'chg-neg'}">${health > 0 ? '+' : ''}${health}</span></div>
    <div class="modal-row"><span>与 ${person.name} 好感度</span><span class="${aff >= 0 ? 'chg-pos' : 'chg-neg'}">${aff >= 0 ? '+' : ''}${aff}</span></div>
  `, onDone)
}

// ─── 跑步游戏 ────────────────────────────────────────────────

let snakeHandle  = null
let snakeNextDir = { x: 1, y: 0 }
let snakeCurDir  = { x: 1, y: 0 }

function setSnakeDir(dx, dy) {
  if (dx === -snakeCurDir.x && dy === -snakeCurDir.y) return
  snakeNextDir = { x: dx, y: dy }
}

function startRunning() {
  if (player.monthStarted && !useEnergy()) return
  tryInvite('跑步', () => openRunningGame())
}

function openRunningGame() {
  const overlay = document.getElementById('game-overlay')
  const canvas  = document.getElementById('game-canvas')
  const info    = document.getElementById('game-info')
  const ctx     = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '跑步 🏃'
  overlay.classList.remove('hidden')
  info.textContent = '方向键 / 滑动控制方向'

  const SIZE = 300
  const GRID = 15
  const CELL = SIZE / GRID

  let snake = [{ x: 7, y: 7 }]
  let food  = placeFood()
  let score = 0

  snakeNextDir = { x: 1, y: 0 }
  snakeCurDir  = { x: 1, y: 0 }

  function placeFood() {
    let p
    do { p = { x: rndInt(GRID), y: rndInt(GRID) } }
    while (snake.some(s => s.x === p.x && s.y === p.y))
    return p
  }

  function draw() {
    // 草地背景
    ctx.fillStyle = '#4a7c42'
    ctx.fillRect(0, 0, SIZE, SIZE)

    // 外圈跑道（橙红色）
    ctx.save()
    ctx.strokeStyle = '#c8602a'
    ctx.lineWidth = 28
    ctx.beginPath()
    ctx.ellipse(SIZE / 2, SIZE / 2, SIZE * 0.38, SIZE * 0.33, 0, 0, Math.PI * 2)
    ctx.stroke()
    // 跑道白色分道线
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    ctx.stroke()
    // 内圈跑道
    ctx.strokeStyle = '#c8602a'
    ctx.lineWidth = 22
    ctx.beginPath()
    ctx.ellipse(SIZE / 2, SIZE / 2, SIZE * 0.21, SIZE * 0.16, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // 能量补给点（黄色圆点）
    ctx.fillStyle = '#f5e030'
    ctx.beginPath()
    ctx.arc((food.x + .5) * CELL, (food.y + .5) * CELL, CELL * .42, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,.25)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 跑者（蓝色）
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#1e3a8a' : '#3b64c8'
      ctx.beginPath()
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 5)
      ctx.fill()
    })

    // 距离显示
    ctx.fillStyle = 'rgba(255,255,255,.9)'
    ctx.font = 'bold 11px system-ui'
    ctx.fillText(`距离 ${score * 50} m`, 5, 14)
  }

  function step() {
    snakeCurDir = { ...snakeNextDir }
    const head  = { x: snake[0].x + snakeCurDir.x, y: snake[0].y + snakeCurDir.y }

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      endRunning(); return
    }

    snake.unshift(head)
    if (head.x === food.x && head.y === food.y) {
      score++
      food = placeFood()
      if (score % 5 === 0 && speed > 80) { speed -= 15; restartTimer() }
    } else {
      snake.pop()
    }
    draw()
  }

  let speed = 180
  let timer = null

  function restartTimer() {
    clearInterval(timer)
    timer = setInterval(step, speed)
  }

  function endRunning() {
    clearInterval(timer)
    const dist  = score * 50
    const mgain = Math.min(10, Math.floor(score / 2) + 2)
    const hgain = Math.min(6,  Math.floor(score / 3) + 2)
    info.textContent = `跑步结束！距离 ${dist}m`
    if (player.monthStarted) applyChanges({ mental: mgain, health: hgain })
    setTimeout(() => {
      closeGame()
      if (player.monthStarted) {
        showModal(`
          <div class="modal-title">🏃 跑步结束</div>
          <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0;">${dist}<span style="font-size:15px;font-weight:500;color:var(--text-muted)"> m</span></div>
          <hr class="modal-divider">
          <div class="modal-row"><span>心理健康</span><span class="chg-pos">+${mgain}</span></div>
          <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hgain}</span></div>
        `)
      }
    }, 1600)
  }

  const onKey = (e) => {
    const map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] }
    const d = map[e.key]
    if (d) { setSnakeDir(d[0], d[1]); e.preventDefault() }
  }
  document.addEventListener('keydown', onKey)

  let touchSt = null
  canvas.addEventListener('touchstart', e => { touchSt = { x: e.touches[0].clientX, y: e.touches[0].clientY } }, { passive: true })
  canvas.addEventListener('touchend', e => {
    if (!touchSt) return
    const dx = e.changedTouches[0].clientX - touchSt.x
    const dy = e.changedTouches[0].clientY - touchSt.y
    if (Math.abs(dx) > Math.abs(dy)) setSnakeDir(dx > 0 ? 1 : -1, 0)
    else                              setSnakeDir(0, dy > 0 ? 1 : -1)
    touchSt = null
  }, { passive: true })

  draw()
  restartTimer()

  snakeHandle = { stop: () => { clearInterval(timer); document.removeEventListener('keydown', onKey) } }
}

function closeGame() {
  document.getElementById('game-overlay').classList.add('hidden')
  document.getElementById('game-info').textContent = ''
  if (snakeHandle) { snakeHandle.stop(); snakeHandle = null }
}

// ─── 弹窗系统 ────────────────────────────────────────────────

let _modalCb = null

function showModal(html, callback, hideOk = false) {
  document.getElementById('modal-body').innerHTML = html
  document.getElementById('modal-overlay').classList.remove('hidden')
  document.getElementById('modal-ok').style.display = hideOk ? 'none' : ''
  _modalCb = callback || null
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden')
  document.getElementById('modal-ok').style.display = ''
  const cb = _modalCb; _modalCb = null
  cb?.()
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal()
}

// ─── 辅助函数 ────────────────────────────────────────────────

const STAT_LABELS = {
  health: '身体健康', mental: '心理健康',
  effort: '努力程度', learning: '学习进度',
}

function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))) }

function deepClone(o) { return JSON.parse(JSON.stringify(o)) }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function rndInt(n) { return Math.floor(Math.random() * n) }

// ─── 启动 ────────────────────────────────────────────────────

init()
