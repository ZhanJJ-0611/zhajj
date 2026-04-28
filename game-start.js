/* ============================================================
   Game Start
   ============================================================ */

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
  relations.teachers = picked.map(t => ({ id: t.id, affinity: t.defaultAffinity, bonded: false, hostilityEventDone: false }))
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

  if (toRemoveIds.size > 0) {
    player.activeTeachers = player.activeTeachers.filter(id => !toRemoveIds.has(id))
    relations.teachers    = relations.teachers.filter(rel => !toRemoveIds.has(rel.id))

    // Pick replacements from teachers whose subject IS selected and who aren't active yet
    const candidates = [...TEACHER_POOL]
      .filter(t => player.selectedSubjects.includes(t.subject) && !player.activeTeachers.includes(t.id))
      .sort(() => Math.random() - 0.5)

    const needed = 4 - relations.teachers.length
    candidates.slice(0, needed).forEach(t => {
      player.activeTeachers.push(t.id)
      relations.teachers.push({ id: t.id, affinity: t.defaultAffinity, bonded: false, hostilityEventDone: false })
    })
  }

  saveState()
}

function initActiveClassmates() {
  const validDefs = (player.activeClassmates || [])
    .map(id => CLASSMATE_POOL.find(c => c.id === id))
    .filter(Boolean)

  const picked = [...validDefs]
  if (picked.length < 4) {
    const existingIds = new Set(picked.map(c => c.id))
    const shuffled = [...CLASSMATE_POOL]
      .filter(c => !existingIds.has(c.id))
      .sort(() => Math.random() - 0.5)
    picked.push(...shuffled.slice(0, 4 - picked.length))
  }

  const relationMap = new Map((relations.classmates || []).map(rel => [rel.id, rel]))
  player.activeClassmates = picked.slice(0, 4).map(c => c.id)
  relations.classmates = picked.slice(0, 4).map(c => {
    const existing = relationMap.get(c.id)
    return {
      id: c.id,
      affinity: existing?.affinity ?? c.defaultAffinity,
      bonded: existing?.bonded ?? false,
      lover: existing?.lover ?? false,
      exLover: existing?.exLover ?? false,
      romanceEventDone: existing?.romanceEventDone ?? false,
      romanceDeclined: existing?.romanceDeclined ?? false,
      interactionBlocked: existing?.interactionBlocked ?? false,
    }
  })
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
  const hasRestorableFlow = !!currentQuiz
    || (currentExam && !currentExam.submitted)
    || (currentGaokao && !currentGaokao.submitted)
    || (currentOlympiad && !currentOlympiad.submitted)
    || (currentEsportsExam && !currentEsportsExam.submitted)

  const resumeMainFlow = () => {
    if (!player.eventShown && player.month <= TOTAL_MONTHS && !hasRestorableFlow) {
      showMonthlyEventPopups(() => resumeCurrentView())
    } else {
      resumeCurrentView()
    }
  }

  if (player.month >= 16 && !player.gaokaoRegistrationDone && !hasRestorableFlow) {
    showGaokaoRegistrationIntro(resumeMainFlow)
  } else {
    resumeMainFlow()
  }
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
  _pendingPlayerName = (player.name || '').trim()
  _tagRerollUsed = false
  renderTagSelectionUI()
}

function renderTagSelectionUI() {
  document.getElementById('title-inner').innerHTML = `
    <div class="tag-sel-title">抽取命运标签</div>
    <div class="tag-sel-sub">两个标签将伴随你的整个高中生涯</div>
    <div class="tag-name-box">
      <div class="tag-name-label">为你的角色命名</div>
      <input
        class="tag-name-input"
        type="text"
        maxlength="12"
        placeholder="请输入角色名字"
        value="${escapeHtml(_pendingPlayerName)}"
        oninput="updatePendingPlayerName(this.value)"
      >
    </div>
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

function updatePendingPlayerName(value) {
  _pendingPlayerName = value.slice(0, 12)
}

function rerollTagsDraw() {
  if (_tagRerollUsed) return
  _tagRerollUsed = true
  _pendingTags = drawTags()
  renderTagSelectionUI()
}

function confirmTagsDraw() {
  const playerName = (_pendingPlayerName || '').trim()
  if (!playerName) {
    showModal(`
      <div class="modal-title">请输入名字</div>
      <div class="event-box" style="margin-bottom:10px">开始游戏前，请先为你的角色取一个名字。</div>
    `)
    return
  }

  const tagNames = _pendingTags.map(t => t.name)
  showModal(`
    <div class="modal-title">确认进入游戏</div>
    <div class="event-box" style="margin-bottom:12px;line-height:1.8">
      你将以 <strong>${escapeHtml(playerName)}</strong> 的身份，带着 <strong>${escapeHtml(tagNames[0])}</strong> 和 <strong>${escapeHtml(tagNames[1])}</strong> 的标签进入游戏。
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn full-width" onclick="closeModal()">返回修改</button>
      <button class="btn btn-primary full-width" onclick="finalizeTagsDraw()">确认进入</button>
    </div>
  `, null, true)
}

function finalizeTagsDraw() {
  document.getElementById('modal-overlay').classList.add('hidden')
  document.getElementById('modal-ok').style.display = ''
  _modalNoDismiss = false
  _modalCb = null

  player.name = (_pendingPlayerName || '').trim()
  player.tags = _pendingTags.map(t => t.id)
  applyInitialTagEffects()
  saveState()
  showIntroOverlay()
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── 过场界面 ────────────────────────────────────────────────

function showIntroOverlay() {
  const overlay = document.getElementById('intro-overlay')
  const textEl  = document.getElementById('intro-text')
  const hintEl  = document.getElementById('intro-hint')
  const decoEl  = document.querySelector('.intro-deco')
  const fullText = '这年秋天\n你如愿来到山河省的\n顶级学府水衡中学\n然而迎接你的\n首先是一场考试'
  const toHtml = s => s.replace(/\n/g, '<br>')

  if (decoEl) decoEl.textContent = '水 衡'
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
  scrollToTop()
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
