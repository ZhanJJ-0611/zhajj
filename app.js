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
  health: 70,
  mental: 70,
  effort: 50,
  learning: 50,
  monthStarted: false,
  studyCount: 0,
  energy: 5,
  maxEnergy: 5,
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
  selectedSubjects: null,
  profExamDone: false,
  gaokaoResult: null,
  placementDone: false,
  classRoom: null,
}

// ─── 标签池 ──────────────────────────────────────────────────

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
      desc: '每月自动损失 10 点心理健康' },
    { id: 'press', name: '高压锅',   icon: '🫙', color: '#b03020',
      desc: '每月自动损失 10 点心理健康和身体健康' },
    { id: 'free',  name: '溜达鸡',   icon: '🐓', color: '#4caf72',
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

const UNIVERSITY_TIERS = [
  { min: 700, school: '清北大学',     badge: '清华 / 北大',
    desc: '全宇宙唯二的顶流学府。考上后你的名字将永驻家族相册C位，七大姑八大姨排队转钱，从未谋面的亲戚也会把你当做每次聚餐的开场白，持续至少三年。' },
  { min: 680, school: '滑舞大学',     badge: '华东五校',
    desc: '名门望族，校园里同学步伐轻盈如滑步，据考证是因为图书馆地板高光打蜡——也可能只是连续熬夜后灵魂出窍的正常表现。' },
  { min: 650, school: '酒吧舞大学',   badge: '985 高校',
    desc: '985名校，学术与人脉并修。前辈经验总结：专业课低飘过关即可，但入学第一个月务必确认自己的酒量，否则圈子融不进去，毕业论文反倒好写。' },
  { min: 600, school: '984.5大学',    badge: '顶尖 211 / 接近985',
    desc: '永远与985差0.5之遥，这0.5是什么？是意难平，是每次聚会被追问"当初差多少分"时的那声叹气，将在你大学四年里精准重放，分毫不差。' },
  { min: 550, school: '二妖妖大学',   badge: '211 高校',
    desc: '211高校，国家认证背书。出门求职HR多扫一眼，虽然最终大多还是"等通知"，但好歹多等了那几秒，某种意义上也算是一种礼遇。' },
  { min: 450, school: '双飞大学',     badge: '双非院校',
    desc: '双非院校，双倍努力，立志飞翔。毕业后将正式起飞，目的地：各大招聘会普通展位、外卖平台的接单界面，以及月租两千的合租App。' },
  { min: 350, school: '茶吾慈孝大学', badge: '查无此校',
    desc: '全网搜不到，百度给不了，地图导不着，录取通知书却确实从天而降。每逢聚会被问"你哪儿上学的"，对方发出一声意味深长的"哦"，话题以光速消亡。' },
  { min: 250, school: '豪华砖科学院', badge: '大专 / 专科',
    desc: '豪华是相对的，砖是绝对的。课程涵盖理论砖技与现场砖法，毕业即入职，工地老师傅亲切迎接，手艺扎实者薪资碾压部分本科生，业界称之为"金蓝领"。' },
  { min: 0,   school: '加里敦大学',   badge: '家里蹲',
    desc: '坐落于你家客厅，图书馆即家里书架，食堂即妈妈厨房，操场即楼下便利店门口。唯一必修课：《如何向父母解释这学期学了什么》，学制不限，毕业遥遥无期。' },
]

function getUniversityTier(score) {
  return UNIVERSITY_TIERS.find(t => score >= t.min) || UNIVERSITY_TIERS[UNIVERSITY_TIERS.length - 1]
}

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

const SUBJECTS         = ['数学','语文','英语','物理','化学','生物','历史','地理','政治']
const CORE_SUBJECTS    = ['数学','语文','英语']
const ELECTIVE_SUBJECTS = ['物理','化学','生物','历史','政治','地理']

// ─── 运行时状态 ─────────────────────────────────────────────

let player    = {}
let relations = {}
let currentPage = 'home'
let currentQuiz     = null
let currentExam     = null
let currentGaokao   = null
let currentSocialTab = 'teachers'
let _quizTimer      = null

// 标签抽取临时状态
let _pendingTags    = []
let _tagRerollUsed  = false

// ─── 标签辅助 ────────────────────────────────────────────────

function hasTag(id) { return (player.tags || []).includes(id) }

function getTagObj(id) {
  for (const pool of Object.values(TAG_POOL)) {
    const t = pool.find(x => x.id === id)
    if (t) return t
  }
  return null
}

function getTagCategory(id) {
  for (const [cat, pool] of Object.entries(TAG_POOL)) {
    if (pool.some(x => x.id === id)) return cat
  }
  return ''
}

// ─── 初始化 ─────────────────────────────────────────────────

function init() {
  loadState()
  showTitleScreen()
}

// ─── 标题屏幕 ────────────────────────────────────────────────

function showTitleScreen() {
  const ts = document.getElementById('title-screen')
  ts.classList.remove('hidden')
  const hasExisting = player.tags && player.tags.length > 0
  document.getElementById('title-inner').innerHTML = `
    <div class="title-school">水 衡 高 中</div>
    <div class="title-main">模 拟 器</div>
    <div class="title-start" onclick="handleTitleStart()">${hasExisting ? '继 续 游 戏' : '开 始 游 戏'}</div>
    ${hasExisting ? '<div class="title-hint">已有存档，点击继续</div>' : '<div class="title-hint">点击开始你的高中旅程</div>'}
  `
}

function handleTitleStart() {
  if (player.tags && player.tags.length > 0) {
    if (!player.placementDone) {
      showPlacementExam()
    } else {
      enterGame()
    }
  } else {
    showTagSelection()
  }
}

function enterGame() {
  document.getElementById('title-screen').classList.add('hidden')
  if (!player.monthStarted && player.month <= TOTAL_MONTHS) {
    autoStartMonth()
  }
  renderStatusBar()
  renderEnergyBar()
  if (!player.eventShown && player.month <= TOTAL_MONTHS) {
    showMonthlyEventPopups(() => switchPage('home'))
  } else {
    switchPage('home')
  }
}

// ─── 月度事件弹窗链 ──────────────────────────────────────────

let _choicePopupCb = null

function showStudyEventPopup(callback) {
  const m = player.month
  let title, text, effect

  if (m >= 30) {
    title = '📝 二轮复习'
    text = '高三下学期开始，进入二轮复习阶段，针对薄弱知识点专项突破，冲刺高考。'
    effect = { effort: -15, health: -5, mental: -5 }
  } else if (m >= 21) {
    title = '📝 一轮复习'
    text = '高考备考正式启动，课程转入全面复习，系统梳理各科知识，打牢基础。'
    effect = { effort: -15 }
  } else {
    title = '📖 学习新知识'
    text = '新的一月开始了，老师讲授了大量新知识点，课业负担加重，需要花时间消化吸收。'
    effect = { learning: -15, effort: -15 }
  }

  applyChanges(effect)
  saveState()

  const effectTagsHtml = Object.entries(effect).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
  }).join('')

  showModal(`
    <div class="modal-title">${title}</div>
    <div class="event-box" style="margin-bottom:10px">${text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `, callback)
}

function showMonthlyEventPopups(callback) {
  player.eventShown = true
  saveState()
  showStudyEventPopup(() => {
    const ev = player.currentEvent
    const afterEvents = () => {
      if (player.month === 16 && !player.profExamDone && player.selectedSubjects) {
        showProfExamIntroPopup()
      } else {
        callback()
      }
    }
    if (!ev) { afterEvents(); return }
    showRandomEventPopup(() => {
      if (player.currentChoiceEvent && !player.choiceEventDone) {
        showChoiceEventPopup(afterEvents)
      } else {
        afterEvents()
      }
    })
  })
}

function showRandomEventPopup(callback) {
  const ev   = player.currentEvent
  const info = getMonthInfo(player.month)
  const effectTagsHtml = Object.entries(ev.effect || {}).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
  }).join('')
  showModal(`
    <div class="modal-title">📅 ${info.grade} ${info.month}月 · 本月事件</div>
    ${ev.name ? `<div class="event-name-tag">【${ev.name}】</div>` : ''}
    <div class="event-box" style="margin-bottom:10px">${ev.text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `, callback)
}

function showChoiceEventPopup(callback) {
  const ev = player.currentChoiceEvent
  _choicePopupCb = callback
  const btnsHtml = ev.choices.map((c, i) =>
    `<button class="choice-btn" onclick="handleChoicePopup(${i})">${c.label}</button>`
  ).join('')
  showModal(`
    <div class="modal-title">⚡ 本月抉择</div>
    <div class="choice-event-text">${ev.text}</div>
    <div class="choice-btns">${btnsHtml}</div>
  `, null, true, true)
}

function handleChoicePopup(index) {
  const ev = player.currentChoiceEvent
  if (!ev) return
  const choice = ev.choices[index]
  player.choiceEventDone  = true
  player.choiceEventChosen = index
  saveState()
  applyChanges(choice.effect)

  const effectRows = Object.entries(choice.effect).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<div class="modal-row"><span>${label}</span><span class="${v >= 0 ? 'chg-pos' : 'chg-neg'}">${v >= 0 ? '+' : ''}${v}</span></div>`
  }).join('')

  const cb = _choicePopupCb; _choicePopupCb = null
  // Force-close the noDismiss modal first, then show result
  document.getElementById('modal-overlay').classList.add('hidden')
  _modalNoDismiss = false
  _modalCb = null

  showModal(`
    <div class="modal-title">✓ 你选择了：${choice.label}</div>
    <div class="choice-result-box" style="margin-bottom:12px">${choice.desc}</div>
    <hr class="modal-divider">
    ${effectRows}
  `, cb)
}

// ─── 会考强制弹窗 ──────────────────────────────────────────────

function showProfExamIntroPopup() {
  if (!player.selectedSubjects) return
  const subjects = ELECTIVE_SUBJECTS.filter(s => !player.selectedSubjects.includes(s))
  showModal(`
    <div class="modal-title">📋 高二会考</div>
    <div class="event-box" style="margin-bottom:12px">
      高二学业水平测试正式开始。本次考察文理分科中未选择的三科，
      成绩将影响心理健康，不计入高考总分。
    </div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">
      考察科目：${subjects.join(' · ')}
    </div>
  `, () => {
    startProficiencyExam()
  }, false, true)
}

// ─── 分科事件 ────────────────────────────────────────────────

let _subjectSelCb      = null
let _subjectSelPending = []

function showSubjectSelection(callback) {
  _subjectSelCb      = callback
  _subjectSelPending = []
  renderSubjectSelModal()
}

function renderSubjectSelModal() {
  const sel = _subjectSelPending
  const btnsHtml = ELECTIVE_SUBJECTS.map(s =>
    `<button class="subject-sel-btn ${sel.includes(s) ? 'active' : ''}" onclick="toggleSubjectSel('${s}')">${s}</button>`
  ).join('')
  const canConfirm = sel.length === 3
  showModal(`
    <div class="modal-title">📚 文理分科</div>
    <div class="event-box" style="margin-bottom:14px">
      高考需要进行选科，请从以下六科中任选 <strong>三科</strong>。<br>
      <span style="font-size:12px;color:var(--text-muted)">之后刷题只出现所选科目和语文数学英语。</span>
    </div>
    <div class="subject-sel-grid">${btnsHtml}</div>
    <div style="text-align:center;font-size:12px;color:var(--text-muted);margin:8px 0">
      已选 ${sel.length} / 3 科
    </div>
    <button class="btn btn-primary full-width" ${canConfirm ? '' : 'disabled'} onclick="confirmSubjectSel()">
      ${canConfirm ? '确认选科' : '请选择三科'}
    </button>
  `, null, true, true)
}

function toggleSubjectSel(subject) {
  const idx = _subjectSelPending.indexOf(subject)
  if (idx >= 0) {
    _subjectSelPending.splice(idx, 1)
  } else if (_subjectSelPending.length < 3) {
    _subjectSelPending.push(subject)
  }
  renderSubjectSelModal()
}

function confirmSubjectSel() {
  if (_subjectSelPending.length !== 3) return
  player.selectedSubjects = [...CORE_SUBJECTS, ..._subjectSelPending]
  saveState()
  document.getElementById('modal-overlay').classList.add('hidden')
  _modalNoDismiss = false; _modalCb = null
  const cb = _subjectSelCb; _subjectSelCb = null
  cb?.()
}

// ─── 标签选择 ────────────────────────────────────────────────

function drawTags() {
  const cats = shuffle(Object.keys(TAG_POOL))
  return [cats[0], cats[1]].map(cat => {
    const pool = TAG_POOL[cat]
    const t = pool[rndInt(pool.length)]
    return { ...t, category: cat }
  })
}

function showTagSelection() {
  _pendingTags = drawTags()
  _tagRerollUsed = false
  renderTagSelectionUI()
}

function renderTagSelectionUI() {
  document.getElementById('title-inner').innerHTML = `
    <div class="tag-sel-title">抽取命运标签</div>
    <div class="tag-sel-sub">两个标签将伴随你的整个高中生涯</div>
    <div class="tag-cards-row">
      ${_pendingTags.map(t => `
        <div class="tag-card" style="border-color:${t.color}44;background:${t.color}12">
          <div class="tag-card-icon">${t.icon}</div>
          <div class="tag-card-name">【${t.name}】</div>
          <div class="tag-card-desc">${t.desc}</div>
        </div>
      `).join('')}
    </div>
    <div class="tag-action-row">
      <button class="tag-btn tag-btn-reroll" onclick="rerollTagsDraw()" ${_tagRerollUsed ? 'disabled' : ''}>
        ${_tagRerollUsed ? '已用重抽' : '重新抽取'}
      </button>
      <button class="tag-btn tag-btn-confirm" onclick="confirmTagsDraw()">确认开始</button>
    </div>
    <div class="tag-sel-sub" style="margin-top:14px;margin-bottom:0">共有一次重抽机会</div>
  `
}

function rerollTagsDraw() {
  if (_tagRerollUsed) return
  _tagRerollUsed = true
  _pendingTags = drawTags()
  renderTagSelectionUI()
}

function confirmTagsDraw() {
  player.tags = _pendingTags.map(t => t.id)
  applyInitialTagEffects()
  saveState()
  showIntroOverlay()
}

// ─── 过场界面 ────────────────────────────────────────────────

let _introTimer = null

function showIntroOverlay() {
  const overlay = document.getElementById('intro-overlay')
  const textEl  = document.getElementById('intro-text')
  const hintEl  = document.getElementById('intro-hint')
  const fullText = '这年秋天，你如愿来到山河省的顶级学府水衡中学，然而迎接你的，首先是一场考试……'

  overlay.classList.add('active')
  textEl.innerHTML = ''
  hintEl.className = 'intro-hint'

  let idx = 0
  let done = false

  function finishTyping() {
    if (_introTimer) { clearInterval(_introTimer); _introTimer = null }
    textEl.textContent = fullText
    done = true
    hintEl.classList.add('visible')
    setTimeout(() => {
      if (!done) return
      hintEl.classList.remove('visible')
      hintEl.style.opacity = '1'
      hintEl.classList.add('pulsing')
    }, 800)
  }

  _introTimer = setInterval(() => {
    idx++
    textEl.innerHTML = fullText.slice(0, idx) + '<span class="intro-cursor"></span>'
    if (idx >= fullText.length) finishTyping()
  }, 72)

  overlay.onclick = () => {
    if (!done) {
      finishTyping()
    } else {
      overlay.classList.remove('active')
      showPlacementExam()
    }
  }
}

function applyInitialTagEffects() {
  if (hasTag('free')) {
    player.health = 100
    player.mental = 100
  }
}

// ─── 分班考试 ────────────────────────────────────────────────

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

let _placementAnswers = []

function showPlacementExam() {
  document.getElementById('title-screen').classList.add('hidden')
  document.getElementById('status-bar').classList.add('hidden')
  document.getElementById('energy-bar').classList.add('hidden')
  document.getElementById('bottom-nav').classList.add('hidden')
  _placementAnswers = new Array(PLACEMENT_QUESTIONS.length).fill(null)
  renderPlacementExam()
}

function renderPlacementExam() {
  const content = document.getElementById('content')
  const answered = _placementAnswers.filter(a => a !== null).length
  const total = PLACEMENT_QUESTIONS.length

  const questionsHtml = PLACEMENT_QUESTIONS.map((q, qi) => `
    <div class="exam-q-block">
      <div class="exam-q-meta">
        <span class="exam-q-num">${qi + 1}</span>
      </div>
      <div class="exam-q-text">${q.q}</div>
      <div class="exam-q-opts">
        ${q.opts.map((opt, oi) => `
          <label class="exam-opt ${_placementAnswers[qi] === oi ? 'chosen' : ''}" onclick="setPlacementAnswer(${qi},${oi})">
            ${opt}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('')

  content.innerHTML = `
    <div class="exam-paper">
      <div class="exam-paper-head">
        <div class="exam-paper-school">水衡高中</div>
        <div class="exam-paper-title">新生入学分班考试</div>
        <div class="exam-paper-info">共 ${total} 题 · 单项选择</div>
      </div>
      <div class="exam-progress">
        <div class="exam-progress-fill" style="width:${(answered / total * 100).toFixed(0)}%"></div>
      </div>
      <div class="exam-paper-body">${questionsHtml}</div>
      <div class="exam-submit-row">
        <span class="exam-submit-count">${answered} / ${total} 已作答</span>
        <button class="btn btn-primary" onclick="submitPlacementExam()" ${answered < total ? 'disabled' : ''}>提交试卷</button>
      </div>
    </div>
  `
}

function setPlacementAnswer(qi, oi) {
  _placementAnswers[qi] = oi
  renderPlacementExam()
}

function submitPlacementExam() {
  const correct = _placementAnswers.reduce((acc, ans, i) => acc + (ans === PLACEMENT_QUESTIONS[i].ans ? 1 : 0), 0)
  let classRoom, classIcon
  if (correct <= 2) { classRoom = '普通班'; classIcon = '📝' }
  else if (correct <= 4) { classRoom = '重点班'; classIcon = '⭐' }
  else { classRoom = '实验班'; classIcon = '🔬' }

  player.classRoom = classRoom
  player.placementDone = true
  saveState()

  document.getElementById('status-bar').classList.remove('hidden')
  document.getElementById('energy-bar').classList.remove('hidden')
  document.getElementById('bottom-nav').classList.remove('hidden')

  showModal(`
    <div style="text-align:center">
      <div style="font-size:2.4rem;margin-bottom:.5rem">${classIcon}</div>
      <div style="font-size:1.2rem;font-weight:700;margin-bottom:.5rem">分班结果揭晓</div>
      <div style="color:var(--text-secondary);margin-bottom:1rem">答对 ${correct} / ${PLACEMENT_QUESTIONS.length} 题</div>
      <div style="font-size:1.5rem;font-weight:700;color:var(--accent)">你被分配到了</div>
      <div style="font-size:2rem;font-weight:700;margin:.4rem 0">${classRoom}</div>
      <div style="color:var(--text-secondary);font-size:.9rem;margin-top:.5rem">祝你高中三年一切顺利！</div>
    </div>
  `, () => {
    showMilitaryTrainingEvent()
  })
}

// ─── 军训事件 ────────────────────────────────────────────────

function showMilitaryTrainingEvent() {
  showModal(`
    <div style="text-align:center;margin-bottom:1rem">
      <div style="font-size:2rem;margin-bottom:.4rem">🪖</div>
      <div style="font-size:1.1rem;font-weight:700;margin-bottom:.5rem">军训汇演</div>
      <div style="color:var(--text-secondary);font-size:.9rem;line-height:1.6;margin-bottom:1.2rem">
        军训进入最后一天，学校要举行汇演。教官问你是否愿意参加展示项目，你想了想……
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:.6rem">
      <button class="btn full-width" onclick="chooseMilitaryOption(0)">🚶 行列式展示</button>
      <button class="btn full-width" onclick="chooseMilitaryOption(1)">🥋 军体拳展示</button>
      <button class="btn full-width" onclick="chooseMilitaryOption(2)">😌 不参与展示</button>
    </div>
  `, null, true, true)
}

function chooseMilitaryOption(idx) {
  const options = [
    { label: '行列式展示', icon: '🚶', desc: '你站在方阵里，步伐整齐，气势十足。教官满意地点头，感觉整个人精气神都提升了不少。', effect: { health: 15 } },
    { label: '军体拳展示', icon: '🥋', desc: '你在台上打出了一套干净利落的军体拳，同学们在台下喝彩。高强度的练习让你身体有些酸，但内心充实极了。', effect: { health: 5, effort: 10 } },
    { label: '不参与展示', icon: '😌', desc: '你退到一旁，安静地看着同学们展示。没有那种聚光灯下的紧张，反而觉得轻松自在，心情很平静。', effect: { mental: 15 } },
  ]
  const opt = options[idx]
  applyChanges(opt.effect)
  saveState()

  const effKeys = { health: '身体', mental: '心理', effort: '努力' }
  const effDesc = Object.entries(opt.effect).map(([k, v]) => `${effKeys[k] || k} ${v > 0 ? '+' : ''}${v}`).join('　')

  showModal(`
    <div style="text-align:center">
      <div style="font-size:2rem;margin-bottom:.4rem">${opt.icon}</div>
      <div class="event-name-tag" style="margin-bottom:.8rem">【${opt.label}】</div>
      <div style="color:var(--text-secondary);font-size:.9rem;line-height:1.6;margin-bottom:1rem">${opt.desc}</div>
      <div style="font-size:.85rem;color:var(--accent);font-weight:600">${effDesc}</div>
    </div>
  `, () => {
    enterGame()
  })
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

function pickMonthlyEvent() {
  const basePool = player.month >= 25 ? EVENTS_HIGH3 : EVENTS_HIGH1_2
  if (hasTag('charming') && Math.random() < 0.6) {
    const pool = basePool.filter(e => !e.affinityEffect || (e.affinityEffect.delta ?? 0) >= 0)
    if (pool.length) return pool[rndInt(pool.length)]
  }
  if (hasTag('awkward') && Math.random() < 0.6) {
    const pool = basePool.filter(e => e.affinityEffect && (e.affinityEffect.delta ?? 0) < 0)
    if (pool.length) return pool[rndInt(pool.length)]
  }
  return basePool[rndInt(basePool.length)]
}

function autoStartMonth() {
  if (!player.currentEvent) {
    player.currentEvent = pickMonthlyEvent()
  }
  if (!player.currentChoiceEvent) {
    player.currentChoiceEvent = CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)]
    player.choiceEventDone = false
    player.choiceEventChosen = null
  }
  player.monthStarted = true
  player.studyCount = 0
  player.energy = player.maxEnergy ?? 5   // 先重置精力，再应用事件效果（事件可能扣精力）

  if (player.currentEvent?.effect) applyChanges(player.currentEvent.effect)
  if (player.currentEvent?.affinityEffect) applyAffinityEffect(player.currentEvent.affinityEffect)

  // 精力类标签（在事件应用后再调整）
  if (hasTag('motor') && Math.random() < 0.3) {
    player.energy = Math.min(player.maxEnergy ?? 5, player.energy + 1)
  }
  if (hasTag('sloth') && Math.random() < 0.3) {
    player.energy = Math.max(0, player.energy - 1)
    player.mental = Math.min(100, (player.mental || 0) + 5)
    player.health = Math.min(100, (player.health || 0) + 5)
  }

  // 家庭类标签
  if (hasTag('kpi'))   player.mental = Math.max(0, (player.mental || 0) - 10)
  if (hasTag('press')) { player.mental = Math.max(0, (player.mental || 0) - 10); player.health = Math.max(0, (player.health || 0) - 10) }

  player.eventShown = false
  saveState()
  renderStatusBar()
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
  const moneyEl = document.getElementById('money-display')
  if (moneyEl) moneyEl.textContent = player.money ?? 0
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
    if (k === 'money') {
      player.money = Math.round((player.money || 0) + d)
    } else if (k === 'energy') {
      player.energy = Math.max(0, Math.min(player.maxEnergy ?? 5, Math.round((player.energy || 0) + d)))
    } else if (k in player) {
      player[k] = clamp(player[k] + d)
    }
  })
  renderStatusBar()
  renderEnergyBar()
  saveState()
}

// ─── 页面路由 ────────────────────────────────────────────────

function switchPage(page) {
  if (page !== 'study') { currentQuiz = null; clearQuizTimer() }
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

// ─── 会考 ─────────────────────────────────────────────────────

function buildProfExamCard() {
  if (player.month !== 16 || player.profExamDone || !player.selectedSubjects) return ''
  const subjects = ELECTIVE_SUBJECTS.filter(s => !player.selectedSubjects.includes(s))
  return `
    <div class="card exam-notice-card" onclick="startProficiencyExam()">
      <div class="card-label" style="margin-bottom:6px">📋 高二学业水平测试</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px;line-height:1.6">
        本月举行会考，涵盖未选科目。成绩将影响心理状态，但不计入高考。
      </div>
      <div style="font-size:12px;color:var(--text-sub);margin-bottom:12px">
        考察科目：${subjects.join(' · ')}
      </div>
      <button class="btn btn-primary full-width">进入会考</button>
    </div>
  `
}

function startProficiencyExam() {
  if (!player.selectedSubjects) return
  const subjects = ELECTIVE_SUBJECTS.filter(s => !player.selectedSubjects.includes(s))
  const questions = []
  subjects.forEach(subj => {
    const bank = QUIZ_BANK[subj] || []
    shuffle([...bank]).slice(0, 3).forEach(q => questions.push({ ...q, subject: subj }))
  })
  currentExam = { questions, answers: new Array(questions.length).fill(-1), submitted: false }
  renderHome()
}

function renderProfExam() {
  const c  = document.getElementById('content')
  const ex = currentExam
  const answered = ex.answers.filter(a => a >= 0).length
  const canSubmit = answered === ex.questions.length

  const questionsHtml = ex.questions.map((q, idx) => `
    <div class="exam-q-block">
      <div class="exam-q-meta">
        <span class="exam-q-num">${idx + 1}</span>
        <span class="exam-q-subj">${q.subject}</span>
      </div>
      <div class="exam-q-text">${q.q}</div>
      <div class="exam-q-opts">
        ${q.opts.map((opt, i) => `
          <label class="exam-opt ${ex.answers[idx] === i ? 'chosen' : ''}">
            <input type="radio" name="eq${idx}" value="${i}" onchange="setExamAnswer(${idx},${i})" ${ex.answers[idx] === i ? 'checked' : ''}>
            ${opt}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('')

  c.innerHTML = `
    <div class="exam-paper">
      <div class="exam-paper-head">
        <div class="exam-paper-school">水衡高中</div>
        <div class="exam-paper-title">高二学业水平测试（合格考）</div>
        <div class="exam-paper-info">共 ${ex.questions.length} 题 · 单项选择</div>
      </div>
      <div class="exam-paper-body">
        ${questionsHtml}
      </div>
      <div class="exam-submit-row">
        <span class="exam-submit-count">${answered} / ${ex.questions.length} 已作答</span>
        <button class="btn btn-primary" ${canSubmit ? '' : 'disabled'} onclick="submitProfExam()">
          交卷
        </button>
      </div>
    </div>
  `
}

function setExamAnswer(idx, choice) {
  if (!currentExam || currentExam.submitted) return
  currentExam.answers[idx] = choice
  renderProfExam()
}

function submitProfExam() {
  if (!currentExam || currentExam.submitted) return
  const ex = currentExam
  const correct = ex.questions.filter((q, i) => ex.answers[i] === q.ans).length
  const total   = ex.questions.length  // 9

  let grade, mentalEff, gradeDesc, gradeColor
  if      (correct >= 7) { grade = 'A'; mentalEff =   8; gradeDesc = '优秀';  gradeColor = '#4caf72' }
  else if (correct >= 5) { grade = 'B'; mentalEff =   0; gradeDesc = '良好';  gradeColor = '#4d9fd4' }
  else if (correct >= 3) { grade = 'C'; mentalEff =  -6; gradeDesc = '及格';  gradeColor = '#e09040' }
  else                   { grade = 'D'; mentalEff = -15; gradeDesc = '不合格'; gradeColor = '#d45555' }

  ex.submitted      = true
  player.profExamDone = true
  saveState()
  if (mentalEff !== 0) applyChanges({ mental: mentalEff })

  showModal(`
    <div class="modal-title">📋 会考成绩单</div>
    <div style="text-align:center;padding:16px 0 10px">
      <div style="font-size:80px;font-weight:900;color:${gradeColor};line-height:1;font-variant-numeric:tabular-nums">${grade}</div>
      <div style="font-size:13px;color:${gradeColor};font-weight:700;margin-top:6px;letter-spacing:1px">${gradeDesc}</div>
    </div>
    <hr class="modal-divider">
    <div class="modal-row">
      <span>心理健康</span>
      <span class="${mentalEff > 0 ? 'chg-pos' : mentalEff < 0 ? 'chg-neg' : ''}">${mentalEff > 0 ? '+' + mentalEff : mentalEff === 0 ? '无变化' : mentalEff}</span>
    </div>
  `, () => { currentExam = null; renderHome() })
}

function showGameOverModal(title, desc) {
  document.getElementById('content').innerHTML = ''
  showModal(`
    <div class="modal-title">${title}</div>
    <p class="muted tc" style="padding:8px 0 14px;line-height:1.7">${desc}</p>
    <button class="btn btn-primary full-width" onclick="doResetGame()">重新开始</button>
  `, null, true, true)
}

function buildTagsCard() {
  const tags = (player.tags || []).map(id => getTagObj(id)).filter(Boolean)
  if (!tags.length) return ''
  const chips = tags.map(t =>
    `<span class="player-tag-chip" style="color:${t.color};background:${t.color}18;border-color:${t.color}44">
      ${t.icon} ${t.name}
    </span>`
  ).join('')
  return `
    <div class="card">
      <div class="card-label">我的标签</div>
      <div class="player-tags-row">${chips}</div>
    </div>
  `
}

// ─── 高考 ──────────────────────────────────────────────────────

const GAOKAO_PERF = {
  灾难发挥: { delta: -50, color: '#d45555', desc: '考场上突然脑子一片空白，平时会的题也做错了好几道，走出考场时双腿有点发软。' },
  失常发挥: { delta: -30, color: '#e09040', desc: '临场有些紧张，几道本来有把握的题犯了低级错误，成绩比预期稍低。' },
  正常发挥: { delta:   0, color: '#4d9fd4', desc: '发挥稳定，基本呈现出了平时的实力水平，没有太多遗憾。' },
  超常发挥: { delta:  10, color: '#4caf72', desc: '思路格外清晰，还碰到了几道之前专门复习过的题，超水平完成了考试！' },
}

function startGaokao() {
  const subjects = player.selectedSubjects || [...CORE_SUBJECTS, ...ELECTIVE_SUBJECTS.slice(0, 3)]
  const questions = []
  subjects.forEach(subj => {
    const bank = QUIZ_BANK[subj] || []
    shuffle([...bank]).slice(0, 3).forEach(q => questions.push({ ...q, subject: subj }))
  })
  currentGaokao = { questions, answers: new Array(questions.length).fill(-1), submitted: false }
  renderGaokaoExam()
}

function renderGaokaoExam() {
  const c  = document.getElementById('content')
  const ex = currentGaokao
  const answered = ex.answers.filter(a => a >= 0).length
  const total = ex.questions.length
  const canSubmit = answered === total

  const questionsHtml = ex.questions.map((q, idx) => `
    <div class="exam-q-block">
      <div class="exam-q-meta">
        <span class="exam-q-num">${idx + 1}</span>
        <span class="exam-q-subj">${q.subject}</span>
      </div>
      <div class="exam-q-text">${q.q}</div>
      <div class="exam-q-opts">
        ${q.opts.map((opt, i) => `
          <label class="exam-opt ${ex.answers[idx] === i ? 'chosen' : ''}">
            <input type="radio" name="gq${idx}" value="${i}" onchange="setGaokaoAnswer(${idx},${i})" ${ex.answers[idx] === i ? 'checked' : ''}>
            ${opt}
          </label>`).join('')}
      </div>
    </div>`).join('')

  c.innerHTML = `
    <div class="exam-paper">
      <div class="exam-paper-head">
        <div class="exam-paper-school">水衡高中</div>
        <div class="exam-paper-title">普通高等学校招生全国统一考试</div>
        <div class="exam-paper-info">共 ${total} 题 · 已答 <span id="gk-answered">${answered}</span> 题</div>
      </div>
      <div class="exam-progress">
        <div class="exam-progress-fill" id="gk-progress" style="width:${(answered/total*100).toFixed(0)}%"></div>
      </div>
      <div class="exam-paper-body">${questionsHtml}</div>
      <div class="exam-submit-row">
        <button class="btn btn-primary full-width" ${canSubmit ? '' : 'disabled'} id="gk-submit" onclick="submitGaokao()">
          ${canSubmit ? '交卷' : `还有 ${total - answered} 题未作答`}
        </button>
      </div>
    </div>`
}

function setGaokaoAnswer(idx, choice) {
  if (!currentGaokao) return
  currentGaokao.answers[idx] = choice
  const answered = currentGaokao.answers.filter(a => a >= 0).length
  const total    = currentGaokao.questions.length
  const canSubmit = answered === total
  const el = id => document.getElementById(id)
  if (el('gk-answered')) el('gk-answered').textContent = answered
  if (el('gk-progress'))  el('gk-progress').style.width = (answered/total*100).toFixed(0) + '%'
  const btn = el('gk-submit')
  if (btn) { btn.disabled = !canSubmit; btn.textContent = canSubmit ? '交卷' : `还有 ${total - answered} 题未作答` }
  document.querySelectorAll(`[name="gq${idx}"]`).forEach(r =>
    r.closest('.exam-opt').classList.toggle('chosen', parseInt(r.value) === choice))
}

function submitGaokao() {
  if (!currentGaokao) return
  const ex = currentGaokao
  const correct = ex.questions.reduce((n, q, i) => n + (ex.answers[i] === q.ans ? 1 : 0), 0)
  const rawBase  = correct / ex.questions.length * 0.30
                 + player.learning / 100 * 0.50
                 + player.mental   / 100 * 0.10
                 + player.health   / 100 * 0.10
  const rawScore = Math.round(Math.max(200, Math.min(710, rawBase * 510 + 200)))

  // Draw performance event
  const r = Math.random()
  let perfKey
  if (player.mental >= 80) {
    perfKey = r < 0.20 ? '失常发挥' : r < 0.80 ? '正常发挥' : '超常发挥'
  } else {
    perfKey = r < 0.10 ? '灾难发挥' : r < 0.50 ? '失常发挥' : r < 0.90 ? '正常发挥' : '超常发挥'
  }
  const perf = GAOKAO_PERF[perfKey]
  const finalScore = Math.max(150, Math.min(750, rawScore + perf.delta))

  ex.submitted       = true
  ex.rawScore        = rawScore
  ex.perfKey         = perfKey
  ex.finalScore      = finalScore
  player.gaokaoResult = { rawScore, perfKey, finalScore }
  saveState()

  showModal(`
    <div class="modal-title">🎲 高考发挥</div>
    <div style="text-align:center;padding:20px 0 14px">
      <div style="font-size:30px;font-weight:900;color:${perf.color};letter-spacing:2px">${perfKey}</div>
      <div style="font-size:20px;font-weight:700;color:${perf.color};margin-top:10px">
        ${perf.delta !== 0 ? (perf.delta > 0 ? '+' : '') + perf.delta + ' 分' : '分数不变'}
      </div>
    </div>
    <div class="event-box">${perf.desc}</div>
  `, () => renderGaokaoResult())
}

function renderGaokaoResult() {
  const c    = document.getElementById('content')
  const data = currentGaokao?.finalScore ? currentGaokao : player.gaokaoResult
  if (!data) { c.innerHTML = renderGraduation(); return }

  const { finalScore, rawScore, perfKey } = data
  const perf = GAOKAO_PERF[perfKey] || GAOKAO_PERF['正常发挥']
  const tier = getUniversityTier(finalScore)
  const avg  = player.examHistory.length
    ? Math.round(player.examHistory.reduce((s, e) => s + e.score, 0) / player.examHistory.length) : 0

  c.innerHTML = `
    <div class="card gaokao-result-card">
      <div class="gaokao-result-label">🎓 高考成绩</div>
      <div class="gaokao-score-big">${finalScore}<span class="gaokao-score-unit">分</span></div>
      <div class="gaokao-event-tag" style="color:${perf.color};border-color:${perf.color}55;background:${perf.color}12">
        ${perfKey}${perf.delta !== 0 ? `（${perf.delta > 0 ? '+' : ''}${perf.delta}）` : ''}
      </div>
      <hr class="modal-divider" style="margin:18px 0">
      <div class="gaokao-school-name">${tier.school}</div>
      <div class="gaokao-tier-badge">${tier.badge}</div>
      <div class="gaokao-desc">${tier.desc}</div>
      <button class="btn btn-primary full-width" style="margin-top:16px" onclick="saveResultCard()">📸 保存成绩单</button>
    </div>
    <div class="card">
      <div class="card-label">高中旅程小结</div>
      <div class="info-row"><span class="muted">最终学习进度</span><span class="info-val">${player.learning}</span></div>
      <div class="info-row"><span class="muted">最终心理健康</span><span class="info-val">${player.mental}</span></div>
      <div class="info-row"><span class="muted">最终身体健康</span><span class="info-val">${player.health}</span></div>
      <div class="info-row"><span class="muted">月考平均分</span><span class="info-val">${avg}</span></div>
      <div class="info-row"><span class="muted">高考原始分</span><span class="info-val">${rawScore}</span></div>
    </div>
    <div class="card">
      <button class="btn full-width" onclick="resetGame()">重新开始</button>
    </div>`
}

function saveResultCard() {
  const data = currentGaokao?.finalScore ? currentGaokao : player.gaokaoResult
  if (!data) return
  const { finalScore, perfKey } = data
  const perf = GAOKAO_PERF[perfKey] || GAOKAO_PERF['正常发挥']
  const tier = getUniversityTier(finalScore)

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = 540, H = 800
  const cv = document.createElement('canvas')
  cv.width  = W * dpr
  cv.height = H * dpr
  const ctx = cv.getContext('2d')
  ctx.scale(dpr, dpr)

  const font = (size, weight) => `${weight || '500'} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`

  // Background
  ctx.fillStyle = '#f7f4ee'
  ctx.fillRect(0, 0, W, H)
  // Top accent
  ctx.fillStyle = '#3d5a4c'
  ctx.fillRect(0, 0, W, 8)
  // Bottom accent
  ctx.fillStyle = '#3d5a4c'
  ctx.fillRect(0, H - 8, W, 8)

  ctx.textAlign = 'center'

  // School
  ctx.fillStyle = '#8a8479'
  ctx.font = font(13)
  ctx.fillText('水 衡 高 中', W / 2, 52)

  // Exam title
  ctx.fillStyle = '#2a2925'
  ctx.font = font(15, 'bold')
  ctx.fillText('普通高等学校招生全国统一考试', W / 2, 84)

  // Divider
  ctx.strokeStyle = '#e2ddd5'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(40, 104); ctx.lineTo(W - 40, 104); ctx.stroke()

  // Score label
  ctx.fillStyle = '#8a8479'
  ctx.font = font(13)
  ctx.fillText('高考成绩', W / 2, 136)

  // Score number
  ctx.fillStyle = '#3d5a4c'
  ctx.font = font(88, '900')
  ctx.fillText(finalScore + ' 分', W / 2, 258)

  // Divider
  ctx.beginPath(); ctx.moveTo(40, 282); ctx.lineTo(W - 40, 282); ctx.stroke()

  // Performance event
  ctx.fillStyle = perf.color
  ctx.font = font(20, 'bold')
  ctx.fillText(perfKey + (perf.delta !== 0 ? `（${perf.delta > 0 ? '+' : ''}${perf.delta}）` : ''), W / 2, 322)

  // University name
  ctx.fillStyle = '#2a2925'
  ctx.font = font(34, 'bold')
  ctx.fillText(tier.school, W / 2, 388)

  // Badge
  ctx.fillStyle = '#8a8479'
  ctx.font = font(14)
  ctx.fillText(tier.badge, W / 2, 416)

  // Divider
  ctx.strokeStyle = '#e2ddd5'
  ctx.beginPath(); ctx.moveTo(40, 436); ctx.lineTo(W - 40, 436); ctx.stroke()

  // Description (wrapped)
  ctx.fillStyle = '#5a5650'
  ctx.font = font(13)
  ctx.textAlign = 'left'
  const maxW = W - 80, lineH = 24
  let x0 = 40, y = 464, line = ''
  for (const ch of tier.desc) {
    const test = line + ch
    if (ctx.measureText(test).width > maxW) { ctx.fillText(line, x0, y); line = ch; y += lineH }
    else line = test
  }
  if (line) ctx.fillText(line, x0, y)

  // Footer
  ctx.textAlign = 'center'
  ctx.fillStyle = '#b8b3aa'
  ctx.font = font(11)
  ctx.fillText('水衡高中模拟器', W / 2, H - 22)

  cv.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `高考成绩单_${finalScore}分.png`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

// ─── 主控页面 ────────────────────────────────────────────────

function renderHome() {
  const c = document.getElementById('content')
  const done = player.month > TOTAL_MONTHS

  if (done) {
    if (currentGaokao) {
      if (!currentGaokao.submitted) { renderGaokaoExam(); return }
      else { renderGaokaoResult(); return }
    }
    if (player.gaokaoResult) { renderGaokaoResult(); return }
    if (player.selectedSubjects) { startGaokao(); return }
    c.innerHTML = renderGraduation()
    return
  }

  if (player.health <= 0) {
    showGameOverModal('😷 生病休学', '身体健康跌至零点，你不得不休学在家静养，高中旅程就此终止。')
    return
  }
  if (player.mental <= 0) {
    showGameOverModal('😔 抑郁休学', '心理健康跌至零点，你陷入严重的抑郁状态，不得不暂停学业。')
    return
  }

  // 会考答题中
  if (currentExam && !currentExam.submitted) {
    renderProfExam()
    return
  }

  if (!player.currentEvent) {
    player.currentEvent = pickMonthlyEvent()
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

    ${buildProfExamCard()}

    <div class="card">
      <button class="btn btn-primary full-width btn-end-month" onclick="endMonth()">
        结束本月
      </button>
      <div class="end-month-hint">请在完成全部操作后结束本月</div>
    </div>

    ${scoreHtml}

    ${buildTagsCard()}

    <div style="text-align:center;padding:4px 0 12px">
      <button class="btn-restart-small" onclick="resetGame()">↺ 重新开始</button>
    </div>
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
  const effortBonus = player.effort > 80 ? 5 : 0
  const mgain  = player.studyCount >= 2 ? -1 : -4
  const efchg  = player.studyCount >= 1 ? 2 : -2
  const changes = { learning: lgain + effortBonus, mental: mgain, effort: efchg }

  // 零花钱结算
  const moneyGain = hasTag('poor') ? 0 : hasTag('rich') ? 600 : hasTag('mid') ? 200 : 100
  player.money = (player.money || 0) + moneyGain

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
  renderEnergyBar()

  // 自动开始新月（包含新月事件效果）
  const isGameOver = player.month > TOTAL_MONTHS
  if (!isGameOver) {
    autoStartMonth()
  }

  const chgRows = Object.entries(changes).map(([k, v]) => {
    const bonusNote = k === 'learning' && effortBonus > 0
      ? ` <span style="font-size:11px;color:var(--text-muted)">(含努力满溢+5)</span>`
      : ''
    return `<div class="modal-row">
      <span>${STAT_LABELS[k]}${bonusNote}</span>
      <span class="${v >= 0 ? 'chg-pos' : 'chg-neg'}">${v >= 0 ? '+' : ''}${v}</span>
    </div>`
  }).join('')

  const info = getMonthInfo(currentMonth)

  showModal(`
    <div class="modal-title">${info.grade} ${info.month}月 · 月末结算</div>
    <div class="modal-row">
      <span>本月考试成绩</span>
      <span class="info-val">${score} / 750</span>
    </div>
    <div class="modal-row">
      <span>零花钱</span>
      <span class="${moneyGain > 0 ? 'chg-pos' : 'chg-neg'}">${moneyGain > 0 ? '+' : ''}${moneyGain} 💰</span>
    </div>
    <hr class="modal-divider">
    ${chgRows}
  `, () => {
    if (isGameOver) { startGaokao(); return }
    // 高一12月结束后触发分科事件
    if (currentMonth === 4 && !player.selectedSubjects) {
      showSubjectSelection(() => showMonthlyEventPopups(renderHome))
    } else {
      showMonthlyEventPopups(renderHome)
    }
  })
}

function calcExamScore() {
  const base = player.learning * 5.25 + player.mental * 1.125 + player.health * 1.125
  const noise = (Math.random() * 80) - 40
  return Math.min(750, Math.max(0, Math.round(base + noise)))
}

function resetGame() {
  showModal(`
    <div class="modal-title">⚠️ 重新开始</div>
    <p class="muted tc" style="padding:4px 0 10px">所有进度将丢失，包括存档和标签，<br>此操作无法撤销。</p>
    <div style="display:flex;gap:8px">
      <button class="btn full-width" onclick="closeModal()">取消</button>
      <button class="btn btn-primary full-width" onclick="doResetGame()">确认重置</button>
    </div>
  `, null, true)
}

function doResetGame() {
  closeModal()
  player    = { ...DEFAULT_PLAYER }
  relations = deepClone(DEFAULT_RELATIONS)
  _pendingTags   = []
  _tagRerollUsed = false
  currentExam    = null
  currentGaokao  = null
  saveState()
  renderStatusBar()
  renderEnergyBar()
  showTitleScreen()
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

  const affBonus = hasTag('charming') ? 2 : 0
  person.affinity = clamp(person.affinity + opt.aff + affBonus)
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
      <span class="chg-pos">+${opt.aff + affBonus}${affBonus > 0 ? ' 😏' : ''}</span>
    </div>
  `, afterInteract)
}

// ─── 刷题计时器 ──────────────────────────────────────────────

function clearQuizTimer() {
  if (_quizTimer) { clearInterval(_quizTimer); _quizTimer = null }
}

function startQuizTimer() {
  clearQuizTimer()
  const TOTAL = 10
  let left = TOTAL

  const refresh = () => {
    const numEl = document.getElementById('quiz-timer-num')
    const barEl = document.getElementById('quiz-timer-bar')
    if (numEl) {
      numEl.textContent = left
      numEl.style.color = left <= 3 ? 'var(--red)' : left <= 5 ? 'var(--orange)' : 'var(--text-muted)'
    }
    if (barEl) {
      barEl.style.width = `${(left / TOTAL) * 100}%`
      barEl.style.background = left <= 3 ? 'var(--red)' : left <= 5 ? 'var(--orange)' : 'var(--blue)'
    }
  }

  refresh()
  _quizTimer = setInterval(() => {
    left--
    refresh()
    if (left <= 0) { clearQuizTimer(); autoExpireQuiz() }
  }, 1000)
}

function autoExpireQuiz() {
  if (!currentQuiz || currentQuiz.answered) return
  currentQuiz.answered = true
  const q = currentQuiz.questions[currentQuiz.current]
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true
    if (i === q.ans) btn.classList.add('correct')
  })
  setTimeout(() => {
    currentQuiz.current++
    currentQuiz.answered = false
    renderQuizActive()
  }, 900)
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
      ${player.selectedSubjects ? `<div class="card-sub-label" style="margin-bottom:8px">已选科：${player.selectedSubjects.join(' · ')}</div>` : ''}
      <div class="subject-row">
        ${(player.selectedSubjects || SUBJECTS).map(s =>
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
      <div class="quiz-timer-wrap">
        <div class="quiz-timer-track"><div class="quiz-timer-bar" id="quiz-timer-bar"></div></div>
        <span class="quiz-timer-num" id="quiz-timer-num">10</span>
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
  startQuizTimer()
}

function answerQuiz(choice) {
  if (!currentQuiz || currentQuiz.answered) return
  currentQuiz.answered = true
  clearQuizTimer()

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
  clearQuizTimer()
  const c  = document.getElementById('content')
  const qz = currentQuiz
  const correct = qz.correct
  const total   = qz.questions.length

  let lgain = Math.ceil(correct * 1.8)
  let egain = correct >= 4 ? 3 : correct >= 2 ? 1 : -1

  // 智商类标签
  const smartBonus = hasTag('smart') ? 2 : 0
  const slowPenalty = hasTag('slow') ? 2 : 0
  const slowEffort  = hasTag('slow') ? 4 : 0
  lgain = Math.max(0, lgain + smartBonus - slowPenalty)
  egain += slowEffort

  const msg = correct === total ? '全对！太厉害了！'
            : correct >= 4     ? '做得不错！'
            : correct >= 2     ? '继续努力！'
            : '需要多加练习哦'

  const tagRows = (smartBonus > 0 ? `<div class="modal-row"><span>🧠 高智商加成</span><span class="chg-pos">+${smartBonus}</span></div>` : '')
               + (slowPenalty > 0 ? `<div class="modal-row"><span>🐦 笨鸟学习减成</span><span class="chg-neg">−${slowPenalty}</span></div>` : '')
               + (slowEffort  > 0 ? `<div class="modal-row"><span>🐦 笨鸟努力加成</span><span class="chg-pos">+${slowEffort}</span></div>` : '')

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
      ${tagRows}
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

let _modalCb       = null
let _modalNoDismiss = false

function showModal(html, callback, hideOk = false, noDismiss = false) {
  document.getElementById('modal-body').innerHTML = html
  document.getElementById('modal-overlay').classList.remove('hidden')
  document.getElementById('modal-ok').style.display = hideOk ? 'none' : ''
  _modalCb        = callback || null
  _modalNoDismiss = noDismiss
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden')
  document.getElementById('modal-ok').style.display = ''
  _modalNoDismiss = false
  const cb = _modalCb; _modalCb = null
  cb?.()
}

function handleOverlayClick(e) {
  if (_modalNoDismiss) return
  if (e.target === document.getElementById('modal-overlay')) closeModal()
}

// ─── 辅助函数 ────────────────────────────────────────────────

const STAT_LABELS = {
  health: '身体健康', mental: '心理健康',
  effort: '努力程度', learning: '学习进度',
  money: '零花钱',  energy: '本月精力',
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
