/* ============================================================
   高中模拟器 — 核心逻辑 v2
   纯前端 SPA，localStorage 存档
   ============================================================ */

// ─── 常量 ───────────────────────────────────────────────────

const TOTAL_MONTHS = 20

// 保留月份：每学年 9,12,1,2,3,5,7 共7个月；高三只到5月（共6月，无暑假）
// 索引 0-6：高一，7-13：高二，14-19：高三
const MONTH_MAP = [9, 12, 1, 2, 3, 5, 7, 9, 12, 1, 2, 3, 5, 7, 9, 12, 1, 2, 3, 5]

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
  olympiadDone: false,
  baosong: false,
  esportsDone: false,
  weireai: false,
  gaokaoResult: null,
  placementDone: false,
  classRoom: null,
  activeTeachers: [],
  activeClassmates: [],
  usedInteractions: [],
  usedActivities: [],
  usedSubjects: [],
  tutorialDone: false,
  seenGameTutorials: [],
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

// 游戏中途解锁的成就标签（不参与初始抽取）
const EARNED_TAGS = {
  qiangjiben: { id: 'qiangjiben', name: '强基计划', icon: '🏆', color: '#c9952a',
    desc: '竞赛中表现优异，高考成绩额外 +40 分' },
}

const DEFAULT_RELATIONS = {
  teachers: [],
  classmates: [],
}


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
let currentOlympiad = null
let currentEsportsExam = null
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
  return EARNED_TAGS[id] || null
}

function getTagCategory(id) {
  for (const [cat, pool] of Object.entries(TAG_POOL)) {
    if (pool.some(x => x.id === id)) return cat
  }
  return ''
}

// ─── 引导程序 ────────────────────────────────────────────────

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

let _tutorialStep = 0

function startTutorial() {
  if (player.tutorialDone) return
  _tutorialStep = 0
  document.getElementById('tutorial-overlay').classList.remove('hidden')
  showTutorialStep(_tutorialStep)
}

function showTutorialStep(idx) {
  const step = TUTORIAL_STEPS[idx]
  const overlay = document.getElementById('tutorial-overlay')
  const highlight = document.getElementById('tutorial-highlight')
  const box = document.getElementById('tutorial-box')
  const stepLabel = document.getElementById('tutorial-step-label')
  const titleEl = document.getElementById('tutorial-title')
  const descEl = document.getElementById('tutorial-desc')
  const nextBtn = document.getElementById('tutorial-next')

  stepLabel.textContent = `引导 ${idx + 1} / ${TUTORIAL_STEPS.length}`
  titleEl.textContent = step.title
  descEl.innerHTML = step.desc.replace(/\n/g, '<br>')
  nextBtn.textContent = idx === TUTORIAL_STEPS.length - 1 ? '开始游戏 ✓' : '下一步 →'

  if (step.target) {
    const el = document.querySelector(step.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      const pad = 6
      highlight.style.display = ''
      highlight.style.top    = (rect.top    - pad) + 'px'
      highlight.style.left   = (rect.left   - pad) + 'px'
      highlight.style.width  = (rect.width  + pad * 2) + 'px'
      highlight.style.height = (rect.height + pad * 2) + 'px'

      // Position box above or below the highlighted element
      if (step.boxPos === 'bottom') {
        box.style.bottom = ''
        box.style.top = (rect.bottom + 16) + 'px'
      } else if (step.boxPos === 'top') {
        box.style.top = ''
        box.style.bottom = (window.innerHeight - rect.top + 16) + 'px'
      }
    }
  } else {
    // No target — center the box, hide highlight
    highlight.style.display = 'none'
    box.style.top = '50%'
    box.style.bottom = ''
    box.style.transform = 'translateX(-50%) translateY(-50%)'
  }

  if (step.target) {
    box.style.transform = 'translateX(-50%)'
  }
}

function tutorialNext() {
  _tutorialStep++
  if (_tutorialStep >= TUTORIAL_STEPS.length) {
    document.getElementById('tutorial-overlay').classList.add('hidden')
    player.tutorialDone = true
    saveState()
    return
  }
  showTutorialStep(_tutorialStep)
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
    showDisclaimer(() => showTagSelection())
  }
}

function showDisclaimer(callback) {
  showModal(`
    <div class="modal-title">📋 游戏说明</div>
    <div style="font-size:13px;line-height:1.85;color:var(--text-secondary)">
      <p style="margin:0 0 2em">本游戏所有内容（包括人物、事件、学校及对话等）均属虚构创作，与现实无关，如有雷同，纯属巧合。</p>
      <p style="margin:0 0 2em">本游戏借助 AI 工具辅助开发，部分内容经由人工智能生成并经人工审校。</p>
      <p style="margin:0 0 2em">本游戏以高中生活为背景，旨在帮助玩家重温青春岁月，不宣扬任何违法、不当或有害的价值观念，不含歧视性、暴力性或低俗内容，无不良价值导向。</p>
      <p style="margin:0 0 2em">游戏内数值与现实存在差异，仅供娱乐，请理性看待。</p>
      <p style="margin:0;color:var(--text-muted);font-size:12px">点击「确定」即表示您已阅读上述说明并同意继续。</p>
    </div>
  `, callback)
}

function initActiveTeachers() {
  if (player.activeTeachers && player.activeTeachers.length > 0) return
  const shuffled = [...TEACHER_POOL].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, 4)
  player.activeTeachers = picked.map(t => t.id)
  relations.teachers = picked.map(t => ({ id: t.id, affinity: t.defaultAffinity, bonded: false }))
  saveState()
}

function filterTeachersForSubjects() {
  if (!player.selectedSubjects || player.selectedSubjects.length === 0) return

  // Remove teachers whose subject is NOT in the player's chosen subjects
  const toRemoveIds = new Set(
    relations.teachers
      .filter(rel => {
        const def = TEACHER_POOL.find(t => t.id === rel.id)
        return def && !player.selectedSubjects.includes(def.subject)
      })
      .map(rel => rel.id)
  )

  if (toRemoveIds.size === 0) return

  player.activeTeachers = player.activeTeachers.filter(id => !toRemoveIds.has(id))
  relations.teachers    = relations.teachers.filter(rel => !toRemoveIds.has(rel.id))

  // Pick replacements from teachers whose subject IS selected and who aren't active yet
  const candidates = [...TEACHER_POOL]
    .filter(t => player.selectedSubjects.includes(t.subject) && !player.activeTeachers.includes(t.id))
    .sort(() => Math.random() - 0.5)

  const needed = 4 - relations.teachers.length
  candidates.slice(0, needed).forEach(t => {
    player.activeTeachers.push(t.id)
    relations.teachers.push({ id: t.id, affinity: t.defaultAffinity, bonded: false })
  })

  saveState()
}

function initActiveClassmates() {
  if (player.activeClassmates && player.activeClassmates.length > 0) return
  const shuffled = [...CLASSMATE_POOL].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, 4)
  player.activeClassmates = picked.map(c => c.id)
  relations.classmates = picked.map(c => ({ id: c.id, affinity: c.defaultAffinity, bonded: false }))
  saveState()
}

function enterGame() {
  initActiveTeachers()
  initActiveClassmates()
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

  if (m >= 19) {
    title = '📝 二轮复习'
    text = '高三下学期开始，进入二轮复习阶段，针对薄弱知识点专项突破，冲刺高考。'
    effect = { effort: -15, health: -5, mental: -5 }
  } else if (m >= 15) {
    title = '📝 一轮复习'
    text = '高考备考正式启动，课程转入全面复习，系统梳理各科知识，打牢基础。'
    effect = { learning: -10, effort: -10 }
  } else {
    title = '📖 学习新知识'
    text = '新的一月开始了，老师讲授了大量新知识点，课业负担加重，需要花时间消化吸收。'
    effect = { learning: -30, effort: -10 }
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
      if (player.month === 13 && hasTag('smart') && !player.olympiadDone) {
        showOlympiadPrompt(callback)
      } else if (player.month === 13 && hasTag('free') && !player.esportsDone) {
        showEsportsPrompt(callback)
      } else if (player.month === 9 && !player.profExamDone && player.selectedSubjects) {
        showProfExamIntroPopup()
      } else {
        callback()
        if (player.month === 1 && !player.tutorialDone) {
          setTimeout(startTutorial, 200)
        }
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
  filterTeachersForSubjects()
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
  const fullText = '这年秋天\n你如愿来到山河省的\n顶级学府水衡中学\n然而迎接你的\n首先是一场考试'
  const toHtml = s => s.replace(/\n/g, '<br>')

  overlay.classList.add('active')
  textEl.innerHTML = ''
  hintEl.className = 'intro-hint'

  let idx = 0
  let done = false

  function finishTyping() {
    if (_introTimer) { clearInterval(_introTimer); _introTimer = null }
    textEl.innerHTML = toHtml(fullText)
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
    textEl.innerHTML = toHtml(fullText.slice(0, idx)) + '<span class="intro-cursor"></span>'
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
let _placementActive  = false

function showPlacementExam() {
  _placementActive = true
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
  _placementActive = false
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

  const statRows = Object.entries(opt.effect).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k] || k}</span>
      <span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  showModal(`
    <div style="text-align:center;margin-bottom:4px">
      <div style="font-size:2rem;margin-bottom:.3rem">${opt.icon}</div>
      <div class="modal-title" style="margin-bottom:0">【${opt.label}】</div>
    </div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${opt.desc}</div>
    <hr class="modal-divider">
    ${statRows}
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
      const reconstructRel = (pool, activeIds, saved) => {
        const defs = activeIds.map(id => pool.find(t => t.id === id)).filter(Boolean)
        return defs.map(def => {
          const sv = saved.find(t => t.id === def.id)
          return { id: def.id, affinity: sv?.affinity ?? def.defaultAffinity, bonded: sv?.bonded ?? false }
        })
      }
      relations = {
        teachers:   reconstructRel(TEACHER_POOL,   player.activeTeachers   || [], loaded.teachers   || []),
        classmates: reconstructRel(CLASSMATE_POOL, player.activeClassmates || [], loaded.classmates || []),
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
  const grade = m <= 7 ? '高一' : m <= 14 ? '高二' : '高三'
  const yearOffset = (m - 1) % 7  // 0=9月,1=12月,2=1月,3=2月,4=3月,5=5月,6=7月
  const actualMonth = MONTH_MAP[m - 1]
  const SEMESTERS = ['上学期', '上学期', '寒假', '寒假', '下学期', '下学期', '暑假']
  const semester = SEMESTERS[yearOffset]
  return { grade, month: actualMonth, semester, seq: m }
}

function getGradeLabel(month) {
  const info = getMonthInfo(month)
  return `${info.grade} · ${info.semester}`
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
  const basePool = player.month >= 15 ? EVENTS_HIGH3 : EVENTS_HIGH1_2
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
  player.usedInteractions = []
  player.usedActivities = []
  player.usedSubjects = []

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

function markActivityUsed(key) {
  if (!player.usedActivities) player.usedActivities = []
  if (!player.usedActivities.includes(key)) {
    player.usedActivities.push(key)
    saveState()
  }
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
  if (player.subjectHistory.length > 11) player.subjectHistory.shift()
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

  // 连续十次未刷某一科目（该科目曾被刷过）
  if (hist.length >= 11) {
    const last10 = hist.slice(-10)
    const allStudied = [...new Set(hist)]
    const neglected = allStudied.filter(s => !last10.includes(s))
    if (neglected.length > 0) {
      player.pendingBias = {
        type: 'neglect', subject: neglected[0],
        message: `你已连续 10 次没有刷 ${neglected[0]} 题，知识点遗忘加速，学习进度将受影响！`,
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

  // 即将连续十次未刷（当前连续九次未刷）
  if (hist.length >= 10) {
    const last9 = hist.slice(-9)
    const allStudied = [...new Set(hist)]
    allStudied.filter(s => !last9.includes(s)).slice(0, 2).forEach(s => {
      warnings.push(`⚠️ ${s} 已连续 9 次未刷，再不刷将触发偏科惩罚`)
    })
  }

  return warnings
}

// ─── 小游戏首次引导 ──────────────────────────────────────────

const GAME_TUTORIALS = {
  running:    { title: '🏃 跑步 · 玩法说明',
    desc: '控制角色收集食物，越吃越长，得分越高收益越高。\n• 方向键 / 左右滑动屏幕控制方向\n• 撞墙或咬到自身立刻结束\n• 得分越高，获得的身体健康越多' },
  basketball: { title: '🏀 篮球 · 玩法说明',
    desc: '共 5 次投篮机会，每次分两步：\n• 第一步：等指针摆到合适位置，点击锁定方向\n• 第二步：再次点击锁定力度\n• 命中越多，获得的身体和心理加成越高' },
  swimming:   { title: '🏊 游泳 · 玩法说明',
    desc: '在三条泳道中闯关，躲避迎面而来的游泳者，顺手捞星星。\n• 点击屏幕左侧 / 右侧切换泳道\n• 被撞三次则游戏结束\n• 坚持越久、星星收集越多，身心加成越高' },
  breakout:   { title: '🏓 乒乓球 · 玩法说明',
    desc: '经典打砖块：移动挡板接住小球，把砖块全部消灭。\n• 鼠标移动 / 触摸滑动控制挡板\n• 球落底则游戏结束\n• 消灭砖块越多，获得的身心加成越高' },
  skyfight:   { title: '🎮 电子游戏 · 玩法说明',
    desc: '驾驶战机，击落敌机并躲避弹幕。\n• 鼠标移动 / 触摸拖动控制飞机\n• 被弹幕击中三次则结束\n• 击落越多、坚持越久，心理健康加成越高' },
  parttime:   { title: '💼 打工 · 玩法说明',
    desc: '记忆翻牌配对，2 分钟内消除所有牌对赚取零花钱。\n• 点击翻开一张牌，再翻开另一张\n• 两张图案相同则消除，不同则翻回\n• 消除对数越多，赚到的钱越多（最多 500 元）' },
}

function showGameTutorial(key, callback) {
  const tut = GAME_TUTORIALS[key]
  if (!tut) { callback(); return }
  const seen = player.seenGameTutorials || []
  if (seen.includes(key)) { callback(); return }
  player.seenGameTutorials = [...seen, key]
  saveState()
  showModal(`
    <div class="modal-title">${tut.title}</div>
    <div class="event-box" style="font-size:13px;line-height:1.8;margin-bottom:14px;white-space:pre-line">${tut.desc}</div>
    <button class="btn btn-primary full-width" onclick="closeModal()">明白了，开始！</button>
  `, callback)
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
  if (!document.getElementById('modal-overlay').classList.contains('hidden')) return
  if (_placementActive || currentQuiz || (currentExam && !currentExam.submitted) || (currentGaokao && !currentGaokao.submitted) || (currentOlympiad && !currentOlympiad.submitted) || (currentEsportsExam && !currentEsportsExam.submitted)) return
  currentPage = page
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === page)
  )
  const pages = { home: renderHome, social: renderSocial, study: renderStudy, fun: renderFun }
  document.getElementById('content').innerHTML = ''
  window.scrollTo(0, 0)
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
      ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#c9952a" stroke="white" stroke-width="2"/>`
      : `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="#ddb870"/>`
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
            <stop offset="0%" stop-color="#c9952a" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#c9952a" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${n > 1 ? `<polygon points="${fillPts}" fill="url(#cg)"/>` : ''}
        ${n > 1 ? `<polyline points="${polyPts}" fill="none" stroke="#c9952a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
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
  if (player.month !== 9 || player.profExamDone || !player.selectedSubjects) return ''
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
  document.getElementById('bottom-nav').classList.add('hidden')
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
  `, () => { currentExam = null; document.getElementById('bottom-nav').classList.remove('hidden'); renderHome() })
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

// ─── 竞赛（隐藏结局） ──────────────────────────────────────────

const OLYMPIAD_SUBJECTS = ['数学', '物理学', '化学', '生物学', '信息学']
const OLYMPIAD_Q_COUNT  = 5   // 每场抽 5 道题

function showOlympiadPrompt(callback) {
  player.olympiadDone = true
  saveState()
  window._olympiadDecline = () => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    callback()
  }
  window._olympiadAccept = () => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    showOlympiadSubjectSelect(callback)
  }
  showModal(`
    <div class="modal-title">🏅 竞赛邀请</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      班主任找到你，说省竞赛委员会来学校选拔参赛选手，凭借你优异的成绩，你获得了参加全国奥林匹克竞赛的资格。这是一次难得的机会，但难度极高……
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="_olympiadDecline()">婉拒参赛</button>
      <button class="btn btn-primary full-width" onclick="_olympiadAccept()">接受挑战</button>
    </div>
  `, null, true)
}

function showOlympiadSubjectSelect(callback) {
  window._olympiadSubject = (subj) => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    startOlympiadExam(subj)
  }
  const btns = OLYMPIAD_SUBJECTS.map(s =>
    `<button class="btn full-width" style="margin-bottom:6px" onclick="_olympiadSubject('${s}')">${s}</button>`
  ).join('')
  showModal(`
    <div class="modal-title">选择竞赛科目</div>
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px;text-align:center">
      选择你最擅长的科目参加竞赛
    </div>
    ${btns}
  `, null, true)
}

function startOlympiadExam(subject) {
  const bank = shuffle([...(OLYMPIAD_BANK[subject] || [])])
  const questions = bank.slice(0, OLYMPIAD_Q_COUNT).map(q => ({ ...q, subject }))
  currentOlympiad = { subject, questions, answers: new Array(OLYMPIAD_Q_COUNT).fill(-1), submitted: false }
  currentPage = 'home'
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === 'home'))
  document.getElementById('bottom-nav').classList.add('hidden')
  document.getElementById('content').innerHTML = ''
  renderOlympiadExam()
}

function renderOlympiadExam() {
  const c  = document.getElementById('content')
  const ex = currentOlympiad
  const answered  = ex.answers.filter(a => a >= 0).length
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
            <input type="radio" name="oq${idx}" value="${i}" onchange="setOlympiadAnswer(${idx},${i})" ${ex.answers[idx] === i ? 'checked' : ''}>
            ${opt}
          </label>`).join('')}
      </div>
    </div>`).join('')

  c.innerHTML = `
    <div class="exam-paper">
      <div class="exam-paper-head">
        <div class="exam-paper-school">全国中学生</div>
        <div class="exam-paper-title">全国${ex.subject}奥林匹克竞赛</div>
        <div class="exam-paper-info">共 ${ex.questions.length} 题 · 单项选择 · 已答 <span id="ol-answered">${answered}</span> 题</div>
      </div>
      <div class="exam-progress">
        <div class="exam-progress-fill" id="ol-progress" style="width:${(answered / ex.questions.length * 100).toFixed(0)}%"></div>
      </div>
      <div class="exam-paper-body">${questionsHtml}</div>
      <div class="exam-submit-row">
        <button class="btn btn-primary full-width" ${canSubmit ? '' : 'disabled'} id="ol-submit" onclick="submitOlympiadExam()">
          ${canSubmit ? '交卷' : `还有 ${ex.questions.length - answered} 题未作答`}
        </button>
      </div>
    </div>`
}

function setOlympiadAnswer(idx, choice) {
  if (!currentOlympiad || currentOlympiad.submitted) return
  currentOlympiad.answers[idx] = choice
  const answered  = currentOlympiad.answers.filter(a => a >= 0).length
  const total     = currentOlympiad.questions.length
  const canSubmit = answered === total
  const el = id => document.getElementById(id)
  if (el('ol-answered')) el('ol-answered').textContent = answered
  if (el('ol-progress'))  el('ol-progress').style.width = (answered / total * 100).toFixed(0) + '%'
  const btn = el('ol-submit')
  if (btn) { btn.disabled = !canSubmit; btn.textContent = canSubmit ? '交卷' : `还有 ${total - answered} 题未作答` }
  document.querySelectorAll(`[name="oq${idx}"]`).forEach(r =>
    r.closest('.exam-opt').classList.toggle('chosen', parseInt(r.value) === choice))
}

function submitOlympiadExam() {
  if (!currentOlympiad || currentOlympiad.submitted) return
  const ex      = currentOlympiad
  const correct = ex.questions.reduce((n, q, i) => n + (ex.answers[i] === q.ans ? 1 : 0), 0)
  const total   = ex.questions.length   // 5

  currentOlympiad.submitted = true
  document.getElementById('bottom-nav').classList.remove('hidden')

  if (correct === total) {
    // 满分 → 保送清北隐藏结局
    player.baosong = true
    player.month   = TOTAL_MONTHS + 1   // 游戏结束
    saveState()
    showModal(`
      <div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:40px">🏆</div>
        <div class="modal-title" style="color:#c9952a">全国一等奖！</div>
      </div>
      <div class="event-box" style="font-size:13px;margin-bottom:12px;">
        你在竞赛中取得了满分，震惊了所有评委！清华大学和北京大学的招生老师当场联系了你，
        恭喜你获得 <strong>保送清华/北大</strong> 的资格！
      </div>
    `, () => { currentOlympiad = null; renderHome() })

  } else if (correct >= 3) {
    // ≥3题 → 强基计划 + 高考+40
    if (!hasTag('qiangjiben')) player.tags.push('qiangjiben')
    saveState()
    showModal(`
      <div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:36px">🥈</div>
        <div class="modal-title">获得强基计划资格</div>
      </div>
      <div class="event-box" style="font-size:13px;margin-bottom:12px;">
        你在竞赛中答对了 ${correct}/${total} 道题，表现优异！获得了 <strong>强基计划</strong> 资格，
        高考成绩将额外加 40 分。
      </div>
      <hr class="modal-divider">
      <div class="modal-row"><span>🏆 强基计划</span><span class="chg-pos">解锁</span></div>
      <div class="modal-row"><span>高考加分</span><span class="chg-pos">+40</span></div>
    `, () => { currentOlympiad = null; renderHome() })

  } else {
    // <3题 → 没能获奖
    showModal(`
      <div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:36px">📄</div>
        <div class="modal-title">遗憾未能获奖</div>
      </div>
      <div class="event-box" style="font-size:13px;margin-bottom:12px;">
        你在竞赛中答对了 ${correct}/${total} 道题，可惜没能达到获奖线。
        但这次经历让你学到了很多，继续加油吧！
      </div>
    `, () => { currentOlympiad = null; renderHome() })
  }
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
  document.getElementById('bottom-nav').classList.add('hidden')
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
  const qiangjiBonus = hasTag('qiangjiben') ? 40 : 0
  const rawScore = Math.round(Math.max(200, Math.min(710, rawBase * 510 + 200 + qiangjiBonus)))

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
  document.getElementById('bottom-nav').classList.remove('hidden')
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
      ${hasTag('qiangjiben') ? `<div class="info-row"><span class="muted">🏆 强基计划加分</span><span class="info-val" style="color:#c9952a">+40</span></div>` : ''}
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

// ─── 保送清北隐藏结局 ─────────────────────────────────────────

function renderBaosongEnding() {
  document.getElementById('bottom-nav').classList.remove('hidden')
  const c = document.getElementById('content')
  const school = Math.random() < 0.5 ? '清北大学' : '麻绳理工'
  player.baosongSchool = player.baosongSchool || school
  saveState()

  c.innerHTML = `
    <div class="card baosong-result-card">
      <div class="baosong-hidden-label">✨ 隐藏结局解锁</div>
      <div class="baosong-title">惊 天 奇 才</div>
      <div class="baosong-school-name">${player.baosongSchool}</div>
      <div class="baosong-tier-badge">全国奥林匹克竞赛满分得主</div>
      <hr class="modal-divider" style="border-color:#c9952a44;margin:18px 0">
      <div class="baosong-desc">
        你在全国奥林匹克竞赛中取得满分，以无可争辩的实力震惊全场。
        招生老师当场递出录取通知，你的高中旅程以最耀眼的方式画上了句号。
      </div>
      <button class="btn baosong-save-btn full-width" style="margin-top:18px" onclick="saveBaosongCard()">📸 保存成绩单</button>
    </div>
    <div class="card">
      <div class="card-label">高中旅程小结</div>
      <div class="info-row"><span class="muted">触发时间</span><span class="info-val">高二 · 5月</span></div>
      <div class="info-row"><span class="muted">最终学习进度</span><span class="info-val">${player.learning}</span></div>
      <div class="info-row"><span class="muted">最终心理健康</span><span class="info-val">${player.mental}</span></div>
      <div class="info-row"><span class="muted">最终身体健康</span><span class="info-val">${player.health}</span></div>
    </div>
    <div class="card">
      <button class="btn full-width" onclick="resetGame()">重新开始</button>
    </div>`
}

function saveBaosongCard() {
  const school = player.baosongSchool || '清华大学'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = 540, H = 800
  const cv = document.createElement('canvas')
  cv.width  = W * dpr
  cv.height = H * dpr
  const ctx = cv.getContext('2d')
  ctx.scale(dpr, dpr)

  const font = (size, weight) => `${weight || '500'} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`

  // Gold gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#fef9e7')
  bg.addColorStop(1, '#fef0c7')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Gold top/bottom accents
  ctx.fillStyle = '#c9952a'
  ctx.fillRect(0, 0, W, 8)
  ctx.fillRect(0, H - 8, W, 8)

  // Decorative side lines
  ctx.strokeStyle = '#c9952a44'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(20, H - 20); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W - 20, 20); ctx.lineTo(W - 20, H - 20); ctx.stroke()

  ctx.textAlign = 'center'

  // Hidden ending label
  ctx.fillStyle = '#c9952a'
  ctx.font = font(12)
  ctx.fillText('✨  隐 藏 结 局 解 锁  ✨', W / 2, 52)

  // Title
  ctx.fillStyle = '#8b6000'
  ctx.font = font(38, '900')
  ctx.fillText('惊 天 奇 才', W / 2, 118)

  // Divider
  ctx.strokeStyle = '#c9952a66'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, 140); ctx.lineTo(W - 80, 140); ctx.stroke()

  // School name
  ctx.fillStyle = '#5a3a00'
  ctx.font = font(48, '900')
  ctx.fillText(school, W / 2, 228)

  // Badge
  ctx.fillStyle = '#c9952a'
  ctx.font = font(14)
  ctx.fillText('全国奥林匹克竞赛满分得主', W / 2, 268)

  // Divider
  ctx.strokeStyle = '#c9952a44'
  ctx.beginPath(); ctx.moveTo(60, 294); ctx.lineTo(W - 60, 294); ctx.stroke()

  // Trophy emoji area
  ctx.font = font(72)
  ctx.fillText('🏆', W / 2, 390)

  // Stats divider
  ctx.strokeStyle = '#c9952a44'
  ctx.beginPath(); ctx.moveTo(60, 420); ctx.lineTo(W - 60, 420); ctx.stroke()

  // Stats
  ctx.font = font(13)
  ctx.textAlign = 'left'
  const stats = [
    ['触发时间', '高二 · 5月'],
    ['学习进度', String(player.learning)],
    ['心理健康', String(player.mental)],
    ['身体健康', String(player.health)],
  ]
  let sy = 456
  stats.forEach(([label, val]) => {
    ctx.fillStyle = '#a07820'
    ctx.fillText(label, 60, sy)
    ctx.fillStyle = '#5a3a00'
    ctx.textAlign = 'right'
    ctx.fillText(val, W - 60, sy)
    ctx.textAlign = 'left'
    sy += 32
  })

  // Desc
  ctx.fillStyle = '#a07820'
  ctx.font = font(12)
  ctx.textAlign = 'center'
  const desc = '以无可争辩的实力震惊全场，高中旅程以最耀眼的方式画上句号'
  ctx.fillText(desc, W / 2, sy + 20)

  // Footer
  ctx.fillStyle = '#c9b06a'
  ctx.font = font(11)
  ctx.fillText('水衡高中模拟器', W / 2, H - 22)

  cv.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `惊天奇才_${school}.png`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

// ─── 不务正业·电竞选手招募 ──────────────────────────────────

function showEsportsPrompt(callback) {
  player.esportsDone = true
  saveState()
  window._esportsDecline = () => {
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    window._esportsDecline = null
    window._esportsAccept  = null
    _modalCb = null
    callback()
  }
  window._esportsAccept = () => {
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    window._esportsDecline = null
    window._esportsAccept  = null
    _modalCb = null
    showEsportsProjectSelect(callback)
  }
  showModal(`
    <div class="modal-title">🎮 不务正业</div>
    <div class="event-box" style="margin-bottom:12px">
      你在网上刷到了一则招募公告：<br>
      <strong>「水衡市首届高中生电竞联赛·选手招募」</strong><br><br>
      参赛者需通过理论知识考核与实战测试两关，表现优异者可代表学校出战，赛事奖金相当可观。<br><br>
      你盯着屏幕沉默了很久——这是你一直以来的热爱。
    </div>
    <div style="display:flex;gap:10px;margin-top:4px">
      <button class="btn full-width" onclick="window._esportsDecline()">算了，还是专心学习</button>
      <button class="btn btn-primary full-width" onclick="window._esportsAccept()">🎮 我要参加！</button>
    </div>
  `, null, true, true)
}

function showEsportsProjectSelect(callback) {
  const projects = ['亡者荣耀', '狗熊联盟', '有畏契约', '绝地求死', '第六人格', '五角洲行动']
  const btns = projects.map(p =>
    `<button class="btn full-width" style="margin-bottom:8px" onclick="window._esportsSubject('${p}')">${p}</button>`
  ).join('')
  window._esportsSubject = (proj) => {
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    window._esportsSubject = null
    _modalCb = null
    startEsportsTheoryExam(proj, callback)
  }
  showModal(`
    <div class="modal-title">🎮 选择你的项目</div>
    <div style="color:var(--text-muted);font-size:13px;margin-bottom:14px">选择你最擅长的电竞项目进行理论考核</div>
    ${btns}
  `, null, true, true)
}

function startEsportsTheoryExam(project, callback) {
  const bank = ESPORTS_BANK[project] || []
  const pool = [...bank].sort(() => Math.random() - 0.5).slice(0, 5)
  currentEsportsExam = {
    project,
    questions: pool,
    answers: Array(pool.length).fill(null),
    submitted: false,
    callback,
  }
  saveState()
  currentPage = 'home'
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === 'home'))
  document.getElementById('content').innerHTML = ''
  renderEsportsExam()
}

function renderEsportsExam() {
  const ex = currentEsportsExam
  const c  = document.getElementById('content')
  const answered  = ex.answers.filter(a => a !== null).length
  const canSubmit = answered === ex.questions.length

  const questionsHtml = ex.questions.map((q, idx) => `
    <div class="exam-q-block">
      <div class="exam-q-meta">
        <span class="exam-q-num">${idx + 1}</span>
      </div>
      <div class="exam-q-text">${q.q}</div>
      <div class="exam-q-opts">
        ${q.opts.map((opt, i) => `
          <label class="exam-opt ${ex.answers[idx] === i ? 'chosen' : ''}">
            <input type="radio" name="eq${idx}" value="${i}" onchange="setEsportsAnswer(${idx},${i})" ${ex.answers[idx] === i ? 'checked' : ''}>
            ${opt}
          </label>`).join('')}
      </div>
    </div>`).join('')

  c.innerHTML = `
    <div class="exam-paper">
      <div class="exam-paper-head">
        <div class="exam-paper-school">电竞选手招募</div>
        <div class="exam-paper-title">${ex.project} 理论知识考核</div>
        <div class="exam-paper-info">共 ${ex.questions.length} 题 · 单项选择 · 已答 <span id="es-answered">${answered}</span> 题</div>
      </div>
      <div class="exam-progress">
        <div class="exam-progress-fill" id="es-progress" style="width:${(answered / ex.questions.length * 100).toFixed(0)}%"></div>
      </div>
      <div class="exam-paper-body">${questionsHtml}</div>
      <div class="exam-submit-row">
        <button class="btn btn-primary full-width" ${canSubmit ? '' : 'disabled'} id="es-submit" onclick="submitEsportsTheoryExam()">
          ${canSubmit ? '交卷' : `还有 ${ex.questions.length - answered} 题未作答`}
        </button>
      </div>
    </div>`
}

function setEsportsAnswer(idx, choice) {
  if (!currentEsportsExam || currentEsportsExam.submitted) return
  currentEsportsExam.answers[idx] = choice
  const answered  = currentEsportsExam.answers.filter(a => a !== null).length
  const total     = currentEsportsExam.questions.length
  const canSubmit = answered === total
  const el = id => document.getElementById(id)
  if (el('es-answered')) el('es-answered').textContent = answered
  if (el('es-progress'))  el('es-progress').style.width = (answered / total * 100).toFixed(0) + '%'
  const btn = el('es-submit')
  if (btn) { btn.disabled = !canSubmit; btn.textContent = canSubmit ? '交卷' : `还有 ${total - answered} 题未作答` }
  document.querySelectorAll(`[name="eq${idx}"]`).forEach(r =>
    r.closest('.exam-opt').classList.toggle('chosen', parseInt(r.value) === choice))
}

function submitEsportsTheoryExam() {
  const ex = currentEsportsExam
  if (!ex || ex.submitted) return
  const correct = ex.questions.reduce((n, q, i) => n + (ex.answers[i] === q.ans ? 1 : 0), 0)

  if (correct < 4) {
    ex.submitted = true
    currentEsportsExam = null
    saveState()
    showModal(`
      <div class="modal-title">🎮 理论考核结束</div>
      <div class="event-box">
        答对 ${correct} / 5 题，未达到晋级标准（4题）。<br><br>
        考官遗憾地摇了摇头："你的知识储备还不够，继续加油吧。"<br><br>
        招募落选，继续你的高中生活。
      </div>
    `, ex.callback)
  } else {
    ex.submitted = true
    saveState()
    startEsportsPracticeTest(ex.project, ex.callback)
  }
}

function startEsportsPracticeTest(project, callback) {
  const infoEl = document.getElementById('game-info')
  window._esportsTestCallback = (score) => {
    if (score >= 3000) {
      player.weireai = true
      player.esportsProject = project
      saveState()
      showModal(`
        <div class="modal-title" style="color:#c9952a">🏆 实战测试通过！</div>
        <div class="event-box">
          得分：<strong>${score}</strong><br><br>
          考官沉默了片刻，随后露出难以置信的笑容：<br>
          "我从没见过高中生能打出这种水准……你录取了。"<br><br>
          你握紧了手机，感觉胸口某个东西裂开又重新愈合。<br>
          <strong>热爱，从来不是错。</strong>
        </div>
      `, () => { renderHome() })
    } else {
      currentEsportsExam = null
      saveState()
      showModal(`
        <div class="modal-title">🎮 实战测试结束</div>
        <div class="event-box">
          得分：<strong>${score}</strong>（需要 3000 分）<br><br>
          考官叹了口气："实力不错，但距离我们的标准还有差距。"<br><br>
          招募落选，继续你的高中生活。
        </div>
      `, callback)
    }
  }
  showModal(`
    <div class="modal-title">🎮 实操测试</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">
      理论考核通过！接下来是最关键的<strong>实操测试</strong>。<br><br>
      你将进入 ${project} 模拟对战，考官将在旁观察你的操作水平。<br><br>
      <strong>目标分数：3000 分</strong><br>
      击落敌机、躲避弹幕，展示你真正的实力！
    </div>
    <hr class="modal-divider">
    <div class="modal-row" style="justify-content:center;color:var(--text-muted);font-size:12px">准备好了吗？点击确认后立即开始</div>
  `, () => {
    if (infoEl) infoEl.textContent = `🎮 ${project} 实战测试  击落敌机   目标分数 3000`
    openSkyFight()
  })
}

function renderWeireaiEnding() {
  const project = player.esportsProject || '电竞'
  const c = document.getElementById('content')
  c.innerHTML = `
    <div class="card baosong-result-card">
      <div class="baosong-hidden-label">✨ 隐藏结局解锁</div>
      <div class="baosong-title" style="letter-spacing:4px">为热爱正名</div>
      <div class="baosong-school-name" style="font-size:26px">${project}</div>
      <div class="baosong-tier-badge">GNR电竞俱乐部 · 招募通过</div>
      <hr style="border-color:#c9952a44;margin:16px 0">
      <div class="baosong-desc">
        没有人天生擅长，只是比别人更热爱。<br>
        你用实力证明了：热爱，可以是一条正确的路。
      </div>
      <div style="font-size:48px;text-align:center;margin:18px 0">🏆</div>
      <hr style="border-color:#c9952a44;margin:16px 0">
      <div class="info-row"><span class="muted">心理健康</span><span class="info-val">${player.mental}</span></div>
      <div class="info-row"><span class="muted">身体健康</span><span class="info-val">${player.health}</span></div>
      <div class="info-row"><span class="muted">学习进度</span><span class="info-val">${player.learning}</span></div>
      <button class="btn baosong-save-btn full-width" style="margin-top:18px" onclick="saveWeireaiCard()">📸 保存成绩单</button>
    </div>`
}

function saveWeireaiCard() {
  const project = player.esportsProject || '电竞'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = 540, H = 800
  const cv = document.createElement('canvas')
  cv.width  = W * dpr
  cv.height = H * dpr
  const ctx = cv.getContext('2d')
  ctx.scale(dpr, dpr)

  const font = (size, weight) => `${weight || '500'} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#fef9e7')
  bg.addColorStop(1, '#fef0c7')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#c9952a'
  ctx.fillRect(0, 0, W, 8)
  ctx.fillRect(0, H - 8, W, 8)

  ctx.strokeStyle = '#c9952a44'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(20, H - 20); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W - 20, 20); ctx.lineTo(W - 20, H - 20); ctx.stroke()

  ctx.textAlign = 'center'

  ctx.fillStyle = '#c9952a'
  ctx.font = font(12)
  ctx.fillText('✨  隐 藏 结 局 解 锁  ✨', W / 2, 52)

  ctx.fillStyle = '#8b6000'
  ctx.font = font(36, '900')
  ctx.fillText('为 热 爱 正 名', W / 2, 116)

  ctx.strokeStyle = '#c9952a66'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, 138); ctx.lineTo(W - 80, 138); ctx.stroke()

  ctx.fillStyle = '#5a3a00'
  ctx.font = font(42, '900')
  ctx.fillText(project, W / 2, 220)

  ctx.fillStyle = '#c9952a'
  ctx.font = font(13)
  ctx.fillText('GNR电竞俱乐部 · 招募通过', W / 2, 258)

  ctx.strokeStyle = '#c9952a44'
  ctx.beginPath(); ctx.moveTo(60, 284); ctx.lineTo(W - 60, 284); ctx.stroke()

  ctx.font = font(68)
  ctx.fillText('🏆', W / 2, 378)

  ctx.strokeStyle = '#c9952a44'
  ctx.beginPath(); ctx.moveTo(60, 408); ctx.lineTo(W - 60, 408); ctx.stroke()

  ctx.font = font(13)
  ctx.textAlign = 'left'
  const stats = [
    ['触发时间', '高二 · 5月'],
    ['电竞项目', project],
    ['心理健康', String(player.mental)],
    ['身体健康', String(player.health)],
  ]
  let sy = 444
  stats.forEach(([label, val]) => {
    ctx.fillStyle = '#a07820'
    ctx.fillText(label, 60, sy)
    ctx.fillStyle = '#5a3a00'
    ctx.textAlign = 'right'
    ctx.fillText(val, W - 60, sy)
    ctx.textAlign = 'left'
    sy += 32
  })

  ctx.fillStyle = '#a07820'
  ctx.font = font(12)
  ctx.textAlign = 'center'
  ctx.fillText('没有人天生擅长，只是比别人更热爱', W / 2, sy + 18)

  ctx.fillStyle = '#c9b06a'
  ctx.font = font(11)
  ctx.fillText('水衡高中模拟器', W / 2, H - 22)

  cv.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `为热爱正名_${project}.png`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

// ─── 主控页面 ────────────────────────────────────────────────

function renderHome() {
  window.scrollTo(0, 0)
  const c = document.getElementById('content')
  const done = player.month > TOTAL_MONTHS

  if (done) {
    if (player.baosong) { renderBaosongEnding(); return }
    if (player.weireai) { renderWeireaiEnding(); return }
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

  // 竞赛答题中
  if (currentOlympiad && !currentOlympiad.submitted) {
    renderOlympiadExam()
    return
  }

  // 电竞理论考核中
  if (currentEsportsExam && !currentEsportsExam.submitted) {
    renderEsportsExam()
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
    if (currentMonth === 2 && !player.selectedSubjects) {
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

  const bondedCount = (arr) => arr.filter(p => p.bonded).length

  const cardsHtml = isTeacher
    ? relations.teachers.map(rel => {
        const def = TEACHER_POOL.find(t => t.id === rel.id)
        return def ? teacherCard(def, rel) : ''
      }).join('')
    : relations.classmates.map(rel => {
        const def = CLASSMATE_POOL.find(c => c.id === rel.id)
        return def ? classmateCard(def, rel) : ''
      }).join('')

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
      ${cardsHtml}
    </div>
  `
}

function classmateCard(def, rel) {
  const affinityColor = rel.bonded || rel.affinity >= 100 ? '#c9952a'
                      : rel.affinity >= 80 ? '#4caf72'
                      : rel.affinity >= 60 ? '#4d9fd4'
                      : rel.affinity >= 40 ? '#e09040'
                      : '#b8b3aa'

  const affinityLabel = rel.bonded           ? '知己之交 ✨'
                      : rel.affinity >= 80   ? '关系很好'
                      : rel.affinity >= 60   ? '关系不错'
                      : rel.affinity >= 40   ? '普通朋友'
                      : '不太熟悉'

  const bondedBadge = rel.bonded ? `<span class="bonded-badge">✨ 知己</span>` : ''
  const mealCost = -(def.interactions.meal.stories[0]?.effect?.money || 0)
  const canAffordMeal = player.money >= mealCost
  const interacted = (player.usedInteractions || []).includes(def.id)

  return `
    <div class="person-card-v2">
      <div class="pcard-top">
        <div class="person-avatar">${def.emoji}</div>
        <div class="person-info">
          <div class="person-name">
            ${def.name}
            <span class="person-tag">${def.trait}</span>
            ${bondedBadge}
          </div>
          ${def.desc ? `<div class="person-desc">${def.desc}</div>` : ''}
        </div>
      </div>
      <div class="pcard-affinity">
        <div class="affinity-label-row">
          <span class="affinity-status" style="color:${affinityColor}">${affinityLabel}</span>
          <span class="affinity-num">${rel.affinity} / 100</span>
        </div>
        <div class="affinity-track-v2">
          <div class="affinity-fill-v2" style="width:${rel.affinity}%;background:${affinityColor}"></div>
        </div>
        ${!rel.bonded ? `<div class="affinity-milestones">
          <span class="mile ${rel.affinity >= 40 ? 'reached' : ''}">40</span>
          <span class="mile ${rel.affinity >= 60 ? 'reached' : ''}">60</span>
          <span class="mile ${rel.affinity >= 80 ? 'reached' : ''}">80</span>
          <span class="mile ${rel.affinity >= 100 ? 'reached' : ''}">✨</span>
        </div>` : ''}
      </div>
      <div class="pcard-actions">
        ${interacted
          ? `<div class="interact-used-hint">本月已互动</div>`
          : `<button class="btn btn-sm interact-btn" onclick="interactClassmate('${def.id}','meal')"${!canAffordMeal ? ' style="opacity:.5"' : ''}>
               🍜 请客 <span style="font-size:.75em;opacity:.7">-${mealCost}💰</span>
             </button>
             <button class="btn btn-sm interact-btn" onclick="interactClassmate('${def.id}','play')">
               🎮 玩耍
             </button>`
        }
      </div>
    </div>
  `
}

function teacherCard(def, rel) {
  const affinityColor = rel.bonded || rel.affinity >= 100 ? '#c9952a'
                      : rel.affinity >= 80 ? '#4caf72'
                      : rel.affinity >= 60 ? '#4d9fd4'
                      : rel.affinity >= 40 ? '#e09040'
                      : '#b8b3aa'

  const affinityLabel = rel.bonded           ? '知己之交 ✨'
                      : rel.affinity >= 80   ? '关系很好'
                      : rel.affinity >= 60   ? '关系不错'
                      : rel.affinity >= 40   ? '普通朋友'
                      : '不太熟悉'

  const bondedBadge = rel.bonded ? `<span class="bonded-badge">✨ 知己</span>` : ''
  const giftCost = -(def.interactions.gift.stories[0]?.effect?.money || 0)
  const canAffordGift = player.money >= giftCost
  const interacted = (player.usedInteractions || []).includes(def.id)

  return `
    <div class="person-card-v2">
      <div class="pcard-top">
        <div class="person-avatar">${def.emoji}</div>
        <div class="person-info">
          <div class="person-name">
            ${def.name}
            <span class="person-tag">${def.trait} · ${def.subject}</span>
            ${bondedBadge}
          </div>
          ${def.desc ? `<div class="person-desc">${def.desc}</div>` : ''}
        </div>
      </div>
      <div class="pcard-affinity">
        <div class="affinity-label-row">
          <span class="affinity-status" style="color:${affinityColor}">${affinityLabel}</span>
          <span class="affinity-num">${rel.affinity} / 100</span>
        </div>
        <div class="affinity-track-v2">
          <div class="affinity-fill-v2" style="width:${rel.affinity}%;background:${affinityColor}"></div>
        </div>
        ${!rel.bonded ? `<div class="affinity-milestones">
          <span class="mile ${rel.affinity >= 40 ? 'reached' : ''}">40</span>
          <span class="mile ${rel.affinity >= 60 ? 'reached' : ''}">60</span>
          <span class="mile ${rel.affinity >= 80 ? 'reached' : ''}">80</span>
          <span class="mile ${rel.affinity >= 100 ? 'reached' : ''}">✨</span>
        </div>` : ''}
      </div>
      <div class="pcard-actions">
        ${interacted
          ? `<div class="interact-used-hint">本月已互动</div>`
          : `<button class="btn btn-sm interact-btn" onclick="interactTeacher('${def.id}','gift')"${!canAffordGift ? ' style="opacity:.5"' : ''}>
               🎁 赠礼 <span style="font-size:.75em;opacity:.7">-${giftCost}💰</span>
             </button>
             <button class="btn btn-sm interact-btn" onclick="interactTeacher('${def.id}','chat')">
               💬 请教
             </button>`
        }
      </div>
    </div>
  `
}

function interactTeacher(id, type) {
  if (!player.monthStarted) {
    showModal('<div class="modal-title">提示</div><p class="muted">请先在主控面板开始本月。</p>')
    return
  }

  const def = TEACHER_POOL.find(t => t.id === id)
  const rel = relations.teachers.find(t => t.id === id)
  if (!def || !rel) return

  const interaction = def.interactions[type]
  if (!interaction) return

  const story = interaction.stories[rndInt(interaction.stories.length)]

  if (type === 'gift') {
    const giftCost = -(story.effect.money || 0)
    if (giftCost > 0 && player.money < giftCost) {
      showModal(`<div class="modal-title">零花钱不足</div><p class="muted">赠送礼物需要 ${giftCost} 元，当前余额不足。</p>`)
      return
    }
  }

  if (!useEnergy()) return

  if (!player.usedInteractions) player.usedInteractions = []
  if (!player.usedInteractions.includes(id)) player.usedInteractions.push(id)

  const { affinity: aff = 0, ...statChanges } = story.effect
  applyChanges(statChanges)

  const affBonus = hasTag('charming') ? 2 : 0
  rel.affinity = clamp(rel.affinity + aff + affBonus)
  const justBonded = !rel.bonded && rel.affinity >= 100
  if (justBonded) { rel.bonded = true; rel.affinity = 100 }
  saveState()

  const rows = Object.entries(statChanges).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k]}</span>
      <span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  const afterInteract = () => {
    if (justBonded && def.bondEvent) {
      window._bondChoice = (idx) => {
        _modalCb = null
        document.getElementById('modal-overlay').classList.add('hidden')
        document.getElementById('modal-ok').style.display = ''
        const choice = def.bondEvent.choices[idx]
        const { affinity: aff = 0, ...statChanges } = choice.effect || {}
        applyChanges(statChanges)
        if (aff) rel.affinity = clamp(rel.affinity + aff)
        saveState()
        const statRows = Object.entries(statChanges).map(([k, v]) =>
          `<div class="modal-row"><span>${STAT_LABELS[k]}</span><span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span></div>`
        ).join('')
        const affRow = aff ? `<div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff > 0 ? 'chg-pos' : 'chg-neg'}">${aff > 0 ? '+' : ''}${aff}</span></div>` : ''
        showModal(`
          <div class="bond-event-icon">${def.emoji}</div>
          <div class="modal-title">✨ ${choice.label}</div>
          ${choice.result ? `<div class="event-box" style="font-size:13px;margin-bottom:12px;">${choice.result}</div>` : ''}
          ${statRows || affRow ? `<hr class="modal-divider">${statRows}${affRow}` : ''}
        `, () => renderSocial())
      }
      showModal(`
        <div class="bond-event-icon">${def.emoji}</div>
        <div class="modal-title">关系升华 ✨</div>
        <div class="event-box" style="font-size:13px;margin-bottom:14px;">${def.bondEvent.story}</div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn full-width" onclick="_bondChoice(0)">${def.bondEvent.choices[0].label}</button>
          <button class="btn btn-primary full-width" onclick="_bondChoice(1)">${def.bondEvent.choices[1].label}</button>
        </div>
      `, () => renderSocial(), true)
    } else {
      renderSocial()
    }
  }

  showModal(`
    <div class="modal-title">${interaction.label}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${story.text}</div>
    <hr class="modal-divider">
    ${rows}
    <div class="modal-row">
      <span>与 ${def.name} 好感度</span>
      <span class="chg-pos">+${aff + affBonus}${affBonus > 0 ? ' 😏' : ''}</span>
    </div>
  `, afterInteract)
}

function interactClassmate(id, type) {
  if (!player.monthStarted) {
    showModal('<div class="modal-title">提示</div><p class="muted">请先在主控面板开始本月。</p>')
    return
  }

  const def = CLASSMATE_POOL.find(c => c.id === id)
  const rel = relations.classmates.find(c => c.id === id)
  if (!def || !rel) return

  const interaction = def.interactions[type]
  if (!interaction) return

  const story = interaction.stories[rndInt(interaction.stories.length)]

  if (type === 'meal') {
    const mealCost = -(story.effect.money || 0)
    if (mealCost > 0 && player.money < mealCost) {
      showModal(`<div class="modal-title">零花钱不足</div><p class="muted">请客吃饭需要 ${mealCost} 元，当前余额不足。</p>`)
      return
    }
  }

  if (!useEnergy()) return

  if (!player.usedInteractions) player.usedInteractions = []
  if (!player.usedInteractions.includes(id)) player.usedInteractions.push(id)

  const { affinity: aff = 0, ...statChanges } = story.effect
  applyChanges(statChanges)

  const affBonus = hasTag('charming') ? 2 : 0
  rel.affinity = clamp(rel.affinity + aff + affBonus)
  const justBonded = !rel.bonded && rel.affinity >= 100
  if (justBonded) { rel.bonded = true; rel.affinity = 100 }
  saveState()

  const rows = Object.entries(statChanges).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k]}</span>
      <span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  const afterInteract = () => {
    if (justBonded && def.bondEvent) {
      window._bondChoice = (idx) => {
        _modalCb = null
        document.getElementById('modal-overlay').classList.add('hidden')
        document.getElementById('modal-ok').style.display = ''
        const choice = def.bondEvent.choices[idx]
        const { affinity: aff = 0, ...statChanges } = choice.effect || {}
        applyChanges(statChanges)
        if (aff) rel.affinity = clamp(rel.affinity + aff)
        saveState()
        const statRows = Object.entries(statChanges).map(([k, v]) =>
          `<div class="modal-row"><span>${STAT_LABELS[k]}</span><span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span></div>`
        ).join('')
        const affRow = aff ? `<div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff > 0 ? 'chg-pos' : 'chg-neg'}">${aff > 0 ? '+' : ''}${aff}</span></div>` : ''
        showModal(`
          <div class="bond-event-icon">${def.emoji}</div>
          <div class="modal-title">✨ ${choice.label}</div>
          ${choice.result ? `<div class="event-box" style="font-size:13px;margin-bottom:12px;">${choice.result}</div>` : ''}
          ${statRows || affRow ? `<hr class="modal-divider">${statRows}${affRow}` : ''}
        `, () => renderSocial())
      }
      showModal(`
        <div class="bond-event-icon">${def.emoji}</div>
        <div class="modal-title">关系升华 ✨</div>
        <div class="event-box" style="font-size:13px;margin-bottom:14px;">${def.bondEvent.story}</div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn full-width" onclick="_bondChoice(0)">${def.bondEvent.choices[0].label}</button>
          <button class="btn btn-primary full-width" onclick="_bondChoice(1)">${def.bondEvent.choices[1].label}</button>
        </div>
      `, () => renderSocial(), true)
    } else {
      renderSocial()
    }
  }

  showModal(`
    <div class="modal-title">${interaction.label}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${story.text}</div>
    <hr class="modal-divider">
    ${rows}
    <div class="modal-row">
      <span>与 ${def.name} 好感度</span>
      <span class="chg-pos">+${aff + affBonus}${affBonus > 0 ? ' 😏' : ''}</span>
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
        ${(player.selectedSubjects || SUBJECTS).map(s => {
          const subjectUsed = (player.usedSubjects || []).includes(s)
          return `<button class="subject-btn${subjectUsed ? ' subject-btn--used' : ''}" onclick="startQuiz('${s}')"
            ${noEnergy || subjectUsed ? 'disabled' : ''}>${s}</button>`
        }).join('')}
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
  if ((player.usedSubjects || []).includes(subject)) return
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
  if (!player.usedSubjects) player.usedSubjects = []
  if (!player.usedSubjects.includes(qz.subject)) player.usedSubjects.push(qz.subject)
  updateSubjectHistory(qz.subject)
  applyChanges({ learning: lgain, effort: egain })
  currentQuiz = null
}

function finishQuiz() {
  renderStudy()
}

// ─── 娱乐页面 ────────────────────────────────────────────────

const GAMES = [
  { icon: '🏃', name: '跑步',     key: 'running',    cost: '1精力', eff: '身体健康',     fn: 'startRunning()' },
  { icon: '🏀', name: '篮球',     key: 'basketball', cost: '1精力', eff: '身体 + 心理', fn: 'startBasketball()' },
  { icon: '🏊', name: '游泳',     key: 'swimming',   cost: '1精力', eff: '身体 + 心理', fn: 'startSwimming()' },
  { icon: '🏓', name: '乒乓球',   key: 'breakout',   cost: '1精力', eff: '身体 + 心理', fn: 'startBreakout()' },
  { icon: '🎮', name: '电子游戏', key: 'skyfight',   cost: '1精力', eff: '心理健康',     fn: 'startSkyFight()' },
  { icon: '🍿', name: '买零食',   key: 'snacks',     cost: '200元', eff: '心理健康',     fn: 'buySnacks()' },
  { icon: '💆', name: '理疗',     key: 'massage',    cost: '500元', eff: '身体健康',     fn: 'getMassage()' },
]

function renderFun() {
  const c = document.getElementById('content')
  const calMonth = getMonthInfo(player.month).month
  const isVacation = [2, 7, 8].includes(calMonth)
  const used = key => (player.usedActivities || []).includes(key)
  const partTimeGame = isVacation ? `
        <div class="game-card${used('parttime') ? ' game-card--used' : ''}" onclick="${used('parttime') ? '' : 'startLinkGame()'}">
          <div class="game-icon">💼</div>
          <div class="game-name">打工</div>
          <div class="game-cost">消耗 2精力</div>
          <div class="game-eff">最多 +500元</div>
        </div>` : ''
  c.innerHTML = `
    <div class="card">
      <div class="card-label">选择活动</div>
      <div class="game-grid">
        ${GAMES.map(g => `
          <div class="game-card${used(g.key) ? ' game-card--used' : ''}" onclick="${used(g.key) ? '' : g.fn}">
            <div class="game-icon">${g.icon}</div>
            <div class="game-name">${g.name}</div>
            <div class="game-cost">消耗 ${g.cost}</div>
            <div class="game-eff">获得 ${g.eff}</div>
          </div>
        `).join('')}
        ${partTimeGame}
      </div>
    </div>
  `
}

function showComingSoon(name) {
  showModal(`<div class="modal-title">${name}</div><p class="muted tc">正在开发中，敬请期待……</p>`)
}

function buySnacks() {
  if (player.money < 200) {
    showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">买零食需要 200 元，当前余额不足。</p>`)
    return
  }
  markActivityUsed('snacks')
  tryShopInvite('🍿 买零食', 200,
    () => {
      applyChanges({ money: -200, mental: 10 })
      saveState()
      showModal(`
        <div class="modal-title">🍿 买零食</div>
        <p style="font-size:13px;text-align:center;color:var(--text-muted);margin:8px 0 14px">买了一大袋零食，边吃边放松，心情好多了！</p>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-200</span></div>
        <div class="modal-row"><span>心理健康</span><span class="chg-pos">+10</span></div>
      `)
    },
    (rel, def) => {
      if (player.money < 300) {
        showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">和同学一起需要 300 元，当前余额不足。</p>`)
        return
      }
      applyChanges({ money: -300, mental: 10 })
      rel.affinity = clamp(rel.affinity + 20)
      saveState()
      showModal(`
        <div class="modal-title">🍿 一起买零食 🎉</div>
        <div class="event-box" style="font-size:13px;margin-bottom:12px;">和 ${def.name} 一起逛小卖部，挑了好多好吃的，边吃边聊，笑声不断，心情超好！</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-300</span></div>
        <div class="modal-row"><span>心理健康</span><span class="chg-pos">+10</span></div>
        <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="chg-pos">+20</span></div>
      `)
    }
  )
}

function getMassage() {
  if (player.money < 500) {
    showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">理疗需要 500 元，当前余额不足。</p>`)
    return
  }
  markActivityUsed('massage')
  tryShopInvite('💆 理疗', 500,
    () => {
      applyChanges({ money: -500, health: 20 })
      saveState()
      showModal(`
        <div class="modal-title">💆 理疗</div>
        <p style="font-size:13px;text-align:center;color:var(--text-muted);margin:8px 0 14px">在专业理疗师的帮助下做了一次全身放松，浑身舒畅！</p>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-500</span></div>
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+20</span></div>
      `)
    },
    (rel, def) => {
      if (player.money < 750) {
        showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">和同学一起理疗需要 750 元，当前余额不足。</p>`)
        return
      }
      applyChanges({ money: -750, health: 20 })
      rel.affinity = clamp(rel.affinity + 20)
      saveState()
      showModal(`
        <div class="modal-title">💆 一起理疗 🎉</div>
        <div class="event-box" style="font-size:13px;margin-bottom:12px;">和 ${def.name} 一起预约了理疗，两人躺着聊天，放松身心，关系也更近了一步！</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-750</span></div>
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+20</span></div>
        <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="chg-pos">+20</span></div>
      `)
    }
  )
}

// 买零食/理疗专用邀约：20% 触发，1.5x 费用，仅正面结果，好感+20
function tryShopInvite(title, baseCost, soloFn, togetherFn) {
  if (!player.monthStarted || Math.random() >= 0.2 || relations.classmates.length === 0) {
    soloFn(); return
  }
  const rel = relations.classmates[rndInt(relations.classmates.length)]
  const def = CLASSMATE_POOL.find(c => c.id === rel.id)
  if (!def) { soloFn(); return }

  const totalCost = Math.round(baseCost * 1.5)

  window._acceptShopInvite = (personId) => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    const r = relations.classmates.find(c => c.id === personId)
    const d = CLASSMATE_POOL.find(c => c.id === personId)
    if (r && d) togetherFn(r, d)
    else soloFn()
  }
  window._declineShopInvite = () => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    soloFn()
  }

  showModal(`
    <div class="modal-title">📣 同学邀约</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      ${def.emoji} <strong>${def.name}</strong> 也想一起${title.replace(/[🍿💆\s]/g, '').trim()}，要同行吗？<br>
      <span style="font-size:11px;color:var(--text-muted)">一起花费 ${totalCost} 元，但好感大增，结果一定是好的！</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="_declineShopInvite()">独自前往</button>
      <button class="btn btn-primary full-width" onclick="_acceptShopInvite('${rel.id}')">一起去！</button>
    </div>
  `, () => soloFn(), true)
}

function tryInvite(activityName, onDone) {
  if (!player.monthStarted || Math.random() >= 0.6 || relations.classmates.length === 0) {
    onDone(false); return
  }
  const rel = relations.classmates[rndInt(relations.classmates.length)]
  const def = CLASSMATE_POOL.find(c => c.id === rel.id)
  if (!def) { onDone(false); return }

  window._acceptInvite = (personId) => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    const r = relations.classmates.find(c => c.id === personId)
    const d = CLASSMATE_POOL.find(c => c.id === personId)
    if (r && d) applyInviteOutcome(r, d, activityName, () => onDone(true))
    else onDone(false)
  }

  showModal(`
    <div class="modal-title">📣 同学邀约</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      ${def.emoji} <strong>${def.name}</strong> 刚好也想去${activityName}，要一起吗？<br>
      <span style="font-size:11px;color:var(--text-muted)">结果可能是好事，也可能起小摩擦……</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="closeModal()">独自进行</button>
      <button class="btn btn-primary full-width" onclick="_acceptInvite('${rel.id}')">一起去！</button>
    </div>
  `, () => onDone(false), true)
}

function applyInviteOutcome(rel, def, activityName, onDone) {
  const good   = Math.random() < 0.6
  const aff    = good ? (rndInt(6) + 4)  : -(rndInt(5) + 3)
  const mental = good ? (rndInt(4) + 4)  : -(rndInt(4) + 3)
  const health = good ? (rndInt(3) + 2)  : rndInt(2)

  const goodDescs = [
    `和 ${def.name} 一起去${activityName}超级开心，越运动越有默契，聊了好多心里话。`,
    `${def.name} 一路给你加油，你发挥得比平时好多了，心情大好！`,
    `一起${activityName}途中笑声不断，压力一扫而空，感觉整个人都轻松了。`,
  ]
  const badDescs = [
    `和 ${def.name} 去${activityName}途中意见不合，带着情绪回来，心情很差。`,
    `${def.name} 状态不好，负面情绪影响了你，这次${activityName}体验很差。`,
    `${def.name} 突然改变计划，让你觉得很扫兴，两人都有些别扭。`,
  ]
  const desc = good ? goodDescs[rndInt(goodDescs.length)] : badDescs[rndInt(badDescs.length)]

  rel.affinity = clamp(rel.affinity + aff)
  applyChanges({ mental, health })
  saveState()

  showModal(`
    <div class="modal-title">${good ? '活动顺利 🎉' : '小有不顺 😤'}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${desc}</div>
    <hr class="modal-divider">
    <div class="modal-row"><span>心理健康</span><span class="${mental >= 0 ? 'chg-pos' : 'chg-neg'}">${mental >= 0 ? '+' : ''}${mental}</span></div>
    <div class="modal-row"><span>身体健康</span><span class="${health > 0 ? 'chg-pos' : 'chg-neg'}">${health > 0 ? '+' : ''}${health}</span></div>
    <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff >= 0 ? 'chg-pos' : 'chg-neg'}">${aff >= 0 ? '+' : ''}${aff}</span></div>
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
  showGameTutorial('running', () => {
    if (player.monthStarted && !useEnergy()) return
    markActivityUsed('running')
    tryInvite('跑步', () => openRunningGame())
  })
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
      if (score % 5 === 0 && speed > 107) { speed -= 11; restartTimer() }
    } else {
      snake.pop()
    }
    draw()
  }

  let speed = 240
  let timer = null

  function restartTimer() {
    clearInterval(timer)
    timer = setInterval(step, speed)
  }

  function endRunning() {
    clearInterval(timer)
    const dist  = score * 50
    const hgain = Math.round(Math.min(dist, 1000) / 1000 * 15)
    info.textContent = `跑步结束！距离 ${dist}m`
    if (player.monthStarted) applyChanges({ health: hgain })
    setTimeout(() => {
      closeGame()
      if (player.monthStarted) {
        showModal(`
          <div class="modal-title">🏃 跑步结束</div>
          <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0;">${dist}<span style="font-size:15px;font-weight:500;color:var(--text-muted)"> m</span></div>
          <hr class="modal-divider">
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
