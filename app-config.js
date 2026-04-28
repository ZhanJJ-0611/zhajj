/* ============================================================
   App config and static content
   ============================================================ */

const TOTAL_MONTHS = 20

// 保留月份：每学年 9,12,1,2,3,5,7 共7个月；高三只到5月（共6月，无暑假）
// 索引 0-6：高一，7-13：高二，14-19：高三
const MONTH_MAP = [9, 12, 1, 2, 3, 5, 7, 9, 12, 1, 2, 3, 5, 7, 9, 12, 1, 2, 3, 5]

const DEFAULT_PLAYER = {
  name: '',
  month: 1,
  health: 70,
  mental: 70,
  effort: 50,
  learning: 0,
  monthStarted: false,
  studyCount: 0,
  energy: 4,
  maxEnergy: 4,
  money: 0,
  tags: [],
  subjectHistory: [],
  pendingBias: null,
  examHistory: [],
  currentEvent: null,
  currentChoiceEvent: null,
  choiceEventDone: false,
  choiceEventChosen: null,
  eventShown: false,
  eventDrawHistory: [],
  drawnMonthlyEventIds: [],
  drawnChoiceEventIds: [],
  selectedSubjects: null,
  profExamDone: false,
  olympiadDone: false,
  baosong: false,
  esportsDone: false,
  weireai: false,
  gaokaoResult: null,
  gaokaoRegistrationDone: false,
  gaokaoRegistrationPassword: '',
  gaokaoExamPromptShown: false,
  placementDone: false,
  classRoom: null,
  activeTeachers: [],
  activeClassmates: [],
  usedInteractions: [],
  usedActivities: [],
  activityCounts: {},
  activityBestScores: {},
  pendingScumbagPunishment: false,
  loverInteractionThisRound: false,
  loverInteractionStreak: 0,
  loverScandalCount: 0,
  pendingLoverScandal: false,
  loverNeglectStreak: 0,
  loverNeglectCount: 0,
  pendingLoverNeglect: false,
  categoryEnergySpent: {
    social: 0,
    study: 0,
    activity: 0,
  },
  usedSubjects: [],
  tutorialDone: false,
  seenGameTutorials: [],
}

const TAG_POOL = {
  智商: [
    { id: 'smart', name: '高智商',   icon: '🧠', color: '#4d9fd4',
      desc: '刷题时额外获得 2 点学习进度' },
    { id: 'slow',  name: '笨鸟先飞', icon: '🐦', color: '#e09040',
      desc: '刷题时减少 2 点学习进度，但额外获得 4 点努力程度' },
  ],
  情商: [
    { id: 'charming', name: '社交恐怖分子', icon: '😏', color: '#4caf72',
      desc: '互动时额外获得对方 2 点好感，更容易触发有利的随机事件' },
    { id: 'awkward',  name: '话题终结者',   icon: '😬', color: '#d45555',
      desc: '更容易触发损失好感的随机事件' },
  ],
  家庭: [
    { id: 'kpi',   name: 'KPI之家', icon: '📊', color: '#d45555',
      desc: '每月自动损失 5 点心理健康' },
    { id: 'press', name: '高压锅',   icon: '🫙', color: '#b03020',
      desc: '每月自动损失 5 点心理健康和 5 点身体健康' },
    { id: 'free',  name: '放养溜达鸡', icon: '🐓', color: '#4caf72',
      desc: '获得初始 100 点身体健康和心理健康' },
  ],
  贫富: [
    { id: 'poor', name: '家徒四壁', icon: '🏚️', color: '#8a8479',
      desc: '每月不获得零花钱' },
    { id: 'mid',  name: '小康之家', icon: '🏠', color: '#4d9fd4',
      desc: '每月额外获得 100 零花钱（共 200）' },
    { id: 'rich', name: '壕无人性', icon: '🏰', color: '#c9952a',
      desc: '每月额外获得 500 零花钱（共 600）' },
  ],
  精力: [
    { id: 'motor', name: '永动机', icon: '⚡', color: '#4d9fd4',
      desc: '每月有 30% 几率额外获得 1 点精力' },
    { id: 'sloth', name: '树懒',   icon: '🦥', color: '#8b6cc8',
      desc: '每月有 30% 几率减少 1 点精力，但恢复 5 点身体和心理健康' },
  ],
}

const EARNED_TAGS = {
  qiangjiben: { id: 'qiangjiben', name: '强基计划', icon: '🏆', color: '#c9952a',
    desc: '竞赛中表现优异，高考成绩额外 +40 分' },
}

const DEFAULT_RELATIONS = {
  teachers: [],
  classmates: [],
}

const UNIVERSITY_TIERS = [
  { min: 700, school: '清北大学',     badge: '宇宙级知名高校',
    desc: '全宇宙唯二的顶流学府。考上后你的名字将永驻家族相册C位，七大姑八大姨排队转钱，从未谋面的亲戚也会把你当做每次聚餐的开场白，持续至少三年。' },
  { min: 680, school: '滑舞大学',     badge: '国家冻梁的产地',
    desc: '名门望族，校园里同学步伐轻盈如滑步，据考证是因为图书馆地板高光打蜡——也可能只是连续熬夜后灵魂出窍的正常表现。' },
  { min: 650, school: '酒吧舞大学',   badge: '超有面子的高校',
    desc: '985名校，学术与人脉并修。前辈经验总结：专业课低飘过关即可，但入学第一个月务必确认自己的酒量，否则圈子融不进去，毕业论文反倒好写。' },
  { min: 600, school: '984.5大学',    badge: '一点点小差距',
    desc: '永远与985差0.5之遥，这0.5是什么？是意难平，是每次聚会被追问"当初差多少分"时的那声叹气，将在你大学四年里精准重放，分毫不差。' },
  { min: 550, school: '二妖妖大学',   badge: '差强人意',
    desc: '211高校，国家认证背书。出门求职HR多扫一眼，虽然最终大多还是"等通知"，但好歹多等了那几秒，某种意义上也算是一种礼遇。' },
  { min: 450, school: '双飞大学',     badge: '梦碎双一流',
    desc: '双非院校，双倍努力，立志飞翔。毕业后将正式起飞，目的地：各大招聘会普通展位、外卖平台的接单界面，以及月租两千的合租App。' },
  { min: 350, school: '茶吾慈孝大学', badge: '至少是本科',
    desc: '全网搜不到，百度给不了，地图导不着，录取通知书却确实从天而降。每逢聚会被问"你哪儿上学的"，对方发出一声意味深长的"哦"，话题以光速消亡。' },
  { min: 250, school: '豪华砖科学院', badge: '好的本科不比大专差',
    desc: '豪华是相对的，砖是绝对的。课程涵盖理论砖技与现场砖法，毕业即入职，工地老师傅亲切迎接，手艺扎实者薪资碾压部分本科生，业界称之为"金蓝领"。' },
  { min: 0,   school: '加里敦大学',   badge: '家中待业',
    desc: '坐落于你家客厅，图书馆即家里书架，食堂即妈妈厨房，操场即楼下便利店门口。唯一必修课：《如何向父母解释这学期学了什么》，学制不限，毕业遥遥无期。' },
]

function getUniversityTier(score) {
  return UNIVERSITY_TIERS.find(t => score >= t.min) || UNIVERSITY_TIERS[UNIVERSITY_TIERS.length - 1]
}

const SUBJECTS = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治']
const CORE_SUBJECTS = ['数学', '语文', '英语']
const ELECTIVE_SUBJECTS = ['物理', '化学', '生物', '历史', '政治', '地理']

const TUTORIAL_STEPS = [
  {
    title: '四项核心数值',
    desc: '屏幕顶部展示你的四项核心数值：身体、心理、努力和学习。它们会随着每个月的活动和事件而变化，直接影响你的月考表现和游戏走向。',
    target: '#status-bar',
    boxPos: 'bottom',
  },
  {
    title: '精力与零花钱',
    desc: '精力决定你这个月能做多少事——每次互动、学习、活动都需要消耗精力。零花钱可以用来购物、送礼，也会随某些事件增减。',
    target: '#energy-bar',
    boxPos: 'bottom',
  },
  {
    title: '月考与本月事件',
    desc: '主页显示本月的随机事件和月考成绩看板。每个月都会发生一件随机事情，有好有坏。月考成绩反映你这段时间的学习积累。',
    target: '[data-page="home"]',
    boxPos: 'top',
  },
  {
    title: '人际界面',
    desc: '在人际界面，你可以与老师和同学互动，增进好感度。好感度积累到一定程度，会触发专属的羁绊事件。每回合每人只能互动一次。',
    target: '[data-page="social"]',
    boxPos: 'top',
  },
  {
    title: '学习界面',
    desc: '在学习界面，你可以按科目刷题来提升学习相关数值。每回合每科只能刷一次，合理分配精力。',
    target: '[data-page="study"]',
    boxPos: 'top',
  },
  {
    title: '活动界面',
    desc: '在活动界面，你可以参加各种课余活动，影响身体和心理状况，也可以在假期打工赚零花钱。每回合每项活动只能参加一次。',
    target: '[data-page="fun"]',
    boxPos: 'top',
  },
  {
    title: '结束本月',
    desc: '准备好后，点击「结束本月」推进时间。每推进一次时间，精力自动恢复，新的事件和机遇随之而来。',
    target: '.btn-end-month',
    boxPos: 'top',
  },
  {
    title: '你的高中三年',
    desc: '游戏共二十轮次，最终迎来高考。好好规划每一轮次，争取在高考中取得理想成绩。\n\n据说，游戏中隐藏着一些特殊结局，等待有心人去发现……',
    target: null,
    boxPos: 'center',
  },
]

const PLACEMENT_QUESTIONS = [
  {
    q: '"水皆缥碧，千丈见底。游鱼细石，直视无碍。"出自哪篇文言文？',
    opts: ['A.《与朱元思书》', 'B.《小石潭记》', 'C.《醉翁亭记》', 'D.《答谢中书书》'],
    ans: 0,
  },
  {
    q: '下列句子中，没有语病的一项是（　）',
    opts: ['A. 通过阅读经典，使我们不仅积累了素材，还提升了语文素养', 'B. 能否坚持体育锻炼，是保持身体健康、增强免疫力的关键因素', 'C. 同学们聚精会神地注视和记录着老师在实验课上的每一个步骤', 'D. 传承中华优秀传统文化，是我们青少年义不容辞的责任'],
    ans: 3,
  },
  {
    q: '下列关于函数概念的判断，正确的是（　）',
    opts: ['A. y²=x 中，y 是 x 的函数', 'B. 函数中，一个 x 值只能对应一个 y 值', 'C. 正比例函数是特殊的一次函数', 'D. 一次函数一定是正比例函数'],
    ans: 2,
  },
  {
    q: '下列关于图形性质的说法，错误的是（　）',
    opts: ['A. 平行四边形对边平行且相等', 'B. 矩形的对角线互相垂直', 'C. 菱形的四条边都相等', 'D. 正方形既是矩形又是菱形'],
    ans: 1,
  },
  {
    q: '—I\'m afraid I can\'t pass the math exam tomorrow. —______! You\'ve studied so hard, and you will make it.',
    opts: ['A. Bad luck', 'B. Don\'t worry', 'C. That\'s right', 'D. Congratulations'],
    ans: 1,
  },
  {
    q: 'We should try our best ______ English well, because it\'s very important ______ us.',
    opts: ['A. learn; for', 'B. to learn; for', 'C. learning; to', 'D. to learn; to'],
    ans: 1,
  },
]

const GAME_TUTORIALS = {
  running: { title: '🏃 跑步 · 玩法说明',
    desc: '控制角色收集食物，越吃越长，得分越高收益越高。\n• 方向键 / 左右滑动屏幕控制方向\n• 撞墙或咬到自身立刻结束\n• 得分越高，获得的身体健康越多' },
  basketball: { title: '🏀 篮球 · 玩法说明',
    desc: '共 5 次投篮机会，每次分两步：\n• 第一步：等指针摆到合适位置，点击锁定方向\n• 第二步：再次点击锁定力度\n• 命中越多，获得的身体和心理加成越高' },
  swimming: { title: '🏊 游泳 · 玩法说明',
    desc: '在三条泳道中闯关，躲避迎面而来的游泳者，顺手捞星星。\n• 点击屏幕左侧 / 右侧切换泳道\n• 被撞三次则游戏结束\n• 坚持越久、星星收集越多，身心加成越高' },
  breakout: { title: '🏓 乒乓球 · 玩法说明',
    desc: '经典打砖块：移动挡板接住小球，把砖块全部消灭。\n• 鼠标移动 / 触摸滑动控制挡板\n• 球落底则游戏结束\n• 消灭砖块越多，获得的身心加成越高' },
  skyfight: { title: '🎮 电子游戏 · 玩法说明',
    desc: '驾驶战机，击落敌机并躲避弹幕。\n• 鼠标移动 / 触摸拖动控制飞机\n• 被弹幕击中三次则结束\n• 击落越多、坚持越久，心理健康加成越高' },
  parttime: { title: '💼 打工 · 玩法说明',
    desc: '记忆翻牌配对，1 分钟内消除所有牌对赚取零花钱。\n• 点击翻开一张牌，再翻开另一张\n• 两张图案相同则消除，不同则翻回\n• 消除对数越多，赚到的钱越多（最多 500 元）' },
}

const OLYMPIAD_SUBJECTS = ['数学', '物理学', '化学', '生物学', '信息学']
const OLYMPIAD_Q_COUNT = 5

const GAOKAO_PERF = {
  灾难发挥: { delta: -50, color: '#d45555', desc: '考场上突然脑子一片空白，平时会的题也做错了好几道，走出考场时双腿有点发软。' },
  失常发挥: { delta: -30, color: '#e09040', desc: '临场有些紧张，几道本来有把握的题犯了低级错误，成绩比预期稍低。' },
  正常发挥: { delta: 0, color: '#4d9fd4', desc: '发挥稳定，基本呈现出了平时的实力水平，没有太多遗憾。' },
  超常发挥: { delta: 10, color: '#4caf72', desc: '思路格外清晰，还碰到了几道之前专门复习过的题，超水平完成了考试！' },
}

const GAMES = [
  { icon: '🏃', name: '跑步', key: 'running', cost: '1精力', eff: '身体健康', fn: 'startRunning()' },
  { icon: '🏀', name: '篮球', key: 'basketball', cost: '1精力', eff: '身体 + 心理', fn: 'startBasketball()' },
  { icon: '🏊', name: '游泳', key: 'swimming', cost: '1精力', eff: '身体 + 心理', fn: 'startSwimming()' },
  { icon: '🏓', name: '乒乓球', key: 'breakout', cost: '1精力', eff: '身体 + 心理', fn: 'startBreakout()' },
  { icon: '🎮', name: '电子游戏', key: 'skyfight', cost: '1精力', eff: '心理健康', fn: 'startSkyFight()' },
  { icon: '🍿', name: '买零食', key: 'snacks', cost: '200元', eff: '心理健康', fn: 'buySnacks()' },
  { icon: '💆', name: '理疗', key: 'massage', cost: '500元', eff: '身体健康', fn: 'getMassage()' },
]

const STAT_LABELS = {
  health: '身体健康',
  mental: '心理健康',
  effort: '努力程度',
  learning: '学习进度',
  money: '零花钱',
  energy: '本月精力',
}

Object.assign(GAME_TUTORIALS, {
  running: {
    title: '跑步 · 玩法说明',
    desc: '控制角色收集补给，跑得越远收益越高。\n1. 用方向键或滑动屏幕控制方向。\n2. 撞墙或撞到自己就会结束。\n3. 距离越远，获得的身体健康越多。',
  },
  basketball: {
    title: '篮球 · 玩法说明',
    desc: '共有 5 次投篮机会，每次分两步进行。\n1. 先点击一次锁定方向。\n2. 再点击一次锁定力度。\n3. 命中越多，获得的身体健康和心理健康越多。',
  },
  swimming: {
    title: '游泳 · 玩法说明',
    desc: '在三条泳道中前进，躲开迎面而来的人，并顺手收集星星。\n1. 点击左右半边屏幕或左右方向键切换泳道。\n2. 撞到来人就会结束。\n3. 坚持越久、星星越多，收益越高。',
  },
  breakout: {
    title: '乒乓球 · 玩法说明',
    desc: '接住小球，把砖块全部打碎。\n1. 用鼠标、触摸或左右方向控制挡板。\n2. 小球掉到底部就会结束。\n3. 打碎砖块越多，获得的身体健康和心理健康越多。',
  },
  skyfight: {
    title: '电子游戏 · 玩法说明',
    desc: '驾驶战机，击落敌机并躲避弹幕。\n1. 用方向键、屏幕方向按钮或触摸拖动控制战机。\n2. 被击中三次就会结束。\n3. 得分越高，坚持越久，获得的心理健康越多。',
  },
  parttime: {
    title: '打工 · 玩法说明',
    desc: '翻开卡片完成配对，在限时内赚取零花钱。\n1. 每次翻开两张牌进行配对。\n2. 相同图案会消除，不同图案会翻回去。\n3. 配对越多，赚到的零花钱越多，最多可得 500 元。',
  },
})

OLYMPIAD_SUBJECTS.splice(0, OLYMPIAD_SUBJECTS.length, '数学', '物理', '化学', '生物', '信息学')

Object.keys(GAOKAO_PERF).forEach(key => delete GAOKAO_PERF[key])
Object.assign(GAOKAO_PERF, {
  灾难发挥: { delta: -50, color: '#d45555', desc: '考场上突然大脑一片空白，平时会做的题也错了好几道，走出考场时整个人都发懵。' },
  失常发挥: { delta: -30, color: '#e09040', desc: '临场有些紧张，几道本来有把握的题犯了低级错误，成绩比预期略低。' },
  正常发挥: { delta: 0, color: '#4d9fd4', desc: '发挥比较稳定，基本展现出了平时的真实水平，没有太多遗憾。' },
  超常发挥: { delta: 10, color: '#4caf72', desc: '思路格外清晰，还碰到了几道之前重点复习过的题，最终超水平完成考试。' },
})

GAMES.splice(
  0,
  GAMES.length,
  { icon: '🏃', name: '跑步', key: 'running', cost: '1 精力', eff: '身体健康', fn: 'startRunning()' },
  { icon: '🏀', name: '篮球', key: 'basketball', cost: '1 精力', eff: '身体 + 心理', fn: 'startBasketball()' },
  { icon: '🏊', name: '游泳', key: 'swimming', cost: '1 精力', eff: '身体 + 心理', fn: 'startSwimming()' },
  { icon: '🏓', name: '乒乓球', key: 'breakout', cost: '1 精力', eff: '身体 + 心理', fn: 'startBreakout()' },
  { icon: '🎮', name: '电子游戏', key: 'skyfight', cost: '1 精力', eff: '心理健康', fn: 'startSkyFight()' },
  { icon: '🍿', name: '买零食', key: 'snacks', cost: '200 元', eff: '心理健康', fn: 'buySnacks()' },
  { icon: '💆', name: '理疗', key: 'massage', cost: '500 元', eff: '身体健康', fn: 'getMassage()' },
)

Object.assign(STAT_LABELS, {
  health: '身体健康',
  mental: '心理健康',
  effort: '努力值',
  learning: '学习值',
  money: '零花钱',
  energy: '本月精力',
})
