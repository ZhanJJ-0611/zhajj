/* ============================================================
   Study Page
   ============================================================ */

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
    saveState()
    renderQuizActive()
  }, 900)
}

// ─── 学习页面 ────────────────────────────────────────────────

function renderStudy() {
  scrollToTop()
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
  if (!useEnergy('study')) return

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
  saveState()
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
      <div class="card-sub-label" style="margin-bottom:8px">小条测时间</div>
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
    saveState()
    renderQuizActive()
  }, 900)
}

function renderQuizResult() {
  clearQuizTimer()
  const c  = document.getElementById('content')
  const qz = currentQuiz
  const correct = qz.correct
  const total   = qz.questions.length

  let lgain = correct === total ? 6 : correct
  let egain = 10

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
  saveState()
}

function finishQuiz() {
  renderStudy()
}

