/* ============================================================
   Home Page
   ============================================================ */

// ─── 页面路由 ────────────────────────────────────────────────

function setActiveNav(page) {
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === page)
  )
}

function isNavigationLocked() {
  return !!currentGaokao || !!player.gaokaoResult || !!player.baosong || !!player.weireai
}

function syncNavigationLockUI() {
  const nav = document.getElementById('bottom-nav')
  if (!nav) return
  nav.classList.toggle('hidden', isNavigationLocked())
}

function renderPage(page) {
  if (isNavigationLocked()) page = 'home'
  currentPage = page
  setActiveNav(page)
  const pages = { home: renderHome, social: renderSocial, study: renderStudy, fun: renderFun }
  document.getElementById('content').innerHTML = ''
  scrollToTop()
  syncNavigationLockUI()
  pages[page]?.()
}

function resumeCurrentView() {
  if (_placementActive) {
    renderPlacementExam()
    return
  }
  if (currentQuiz) {
    renderPage('study')
    return
  }
  if ((currentExam && !currentExam.submitted)
    || (currentGaokao && !currentGaokao.submitted)
    || (currentOlympiad && !currentOlympiad.submitted)
    || (currentEsportsExam && !currentEsportsExam.submitted)) {
    renderPage('home')
    return
  }
  renderPage(currentPage || 'home')
}

function switchPage(page) {
  if (!document.getElementById('modal-overlay').classList.contains('hidden')) return
  if (_placementActive || currentQuiz || (currentExam && !currentExam.submitted) || (currentGaokao && !currentGaokao.submitted) || (currentOlympiad && !currentOlympiad.submitted) || (currentEsportsExam && !currentEsportsExam.submitted) || isNavigationLocked()) return
  renderPage(page)
  saveState()
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


// ─── 主控页面 ────────────────────────────────────────────────

function renderHome() {
  scrollToTop()
  syncNavigationLockUI()
  const c = document.getElementById('content')
  const done = player.month > TOTAL_MONTHS

  if (done) {
    if (player.baosong) { renderBaosongEnding(); return }
    if (player.weireai) { renderWeireaiEnding(); return }
    if (currentGaokao) {
      if (!currentGaokao.submitted) { renderGaokaoExam(); return }
      if (!currentGaokao.queryCompleted) { renderGaokaoQueryPending(); return }
      renderGaokaoResult(); return
    }
    if (player.gaokaoResult) { renderGaokaoResult(); return }
    if (player.selectedSubjects) {
      if (!player.gaokaoExamPromptShown) {
        showGaokaoExamIntro(() => startGaokao())
      } else {
        startGaokao()
      }
      return
    }
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
  const loverCount = getLoverClassmates().length
  const score  = calcExamScore()
  const lgain  = clamp(Math.ceil(player.effort * 0.06 + player.learning * 0.04 + Math.random() * 4) - 2)
  const effortBonus = player.effort > 80 ? 10 : 0
  const mgain  = player.studyCount >= 2 ? -1 : -4
  const efchg  = player.studyCount >= 1 ? 0 : -10
  const changes = { learning: lgain + effortBonus, mental: mgain, effort: efchg }

  // 零花钱结算
  const moneyGain = hasTag('poor') ? 0 : hasTag('rich') ? 600 : hasTag('mid') ? 200 : 100
  player.money = (player.money || 0) + moneyGain

  player.examHistory.push({ month: currentMonth, score })
  applyChanges(changes)
  if (loverCount >= 2 && currentMonth < TOTAL_MONTHS) {
    player.pendingScumbagPunishment = true
  }

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
    const displayBonusNote = k === 'learning' && effortBonus > 0
      ? ' <span style="font-size:11px;color:var(--text-muted)">(+10)</span>'
      : bonusNote
    return `<div class="modal-row">
      <span>${STAT_LABELS[k]}${displayBonusNote}</span>
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
    if (isGameOver) {
      showGaokaoExamIntro(() => startGaokao())
      return
    }
    const continueMainFlow = () => {
      if (currentMonth === 15 && !player.gaokaoRegistrationDone) {
        showGaokaoRegistrationIntro(() => showMonthlyEventPopups(renderHome))
        return
      }
      showMonthlyEventPopups(renderHome)
    }

    // 高一12月结束后触发分科事件
    if (currentMonth === 2 && !player.selectedSubjects) {
      showSubjectSelection(continueMainFlow)
    } else {
      continueMainFlow()
    }
  })
}

function calcExamScore() {
  const base = player.learning * 5.25 + player.mental * 1.125 + player.health * 1.125
  const noise = (Math.random() * 80) - 40
  return Math.min(680, Math.max(200, Math.round(base + noise)))
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
  closeGame()
  player    = { ...DEFAULT_PLAYER }
  relations = deepClone(DEFAULT_RELATIONS)
  _pendingTags   = []
  _tagRerollUsed = false
  clearRuntimeState()
  saveState()
  document.getElementById('bottom-nav').classList.remove('hidden')
  renderStatusBar()
  renderEnergyBar()
  showTitleScreen()
}
