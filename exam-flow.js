/* ============================================================
   Exam Flow
   ============================================================ */

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
  saveState()
  document.getElementById('bottom-nav').classList.add('hidden')
  renderHome()
}

function renderProfExam() {
  scrollToTop()
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
  saveState()
  renderProfExam()
}

function submitProfExam() {
  if (!currentExam || currentExam.submitted) return
  const ex = currentExam
  const correct = ex.questions.filter((q, i) => ex.answers[i] === q.ans).length
  const total   = ex.questions.length  // 9
  const failedProfExam = correct < 3

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
  `, () => {
    if (failedProfExam) {
      currentExam = null
      saveState()
      showGameOverModal('📋 会考不合格退学', '你在高二学业水平测试中获得 D 评级，学校认定你未达到继续就读要求，最终作出退学处理。你的高中旅程就此终止。')
      return
    }
    currentExam = null
    saveState()
    document.getElementById('bottom-nav').classList.remove('hidden')
    renderHome()
  })
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
  saveState()
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === 'home'))
  document.getElementById('bottom-nav').classList.add('hidden')
  document.getElementById('content').innerHTML = ''
  renderOlympiadExam()
}

function renderOlympiadExam() {
  scrollToTop()
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
  saveState()
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
    `, () => {
      currentOlympiad = null
      saveState()
      renderHome()
    })

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
    `, () => {
      currentOlympiad = null
      saveState()
      renderHome()
    })

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
    `, () => {
      currentOlympiad = null
      saveState()
      renderHome()
    })
  }
}

// ─── 高考 ──────────────────────────────────────────────────────

function showGaokaoExamIntro(callback) {
  player.gaokaoExamPromptShown = true
  saveState()
  showModal(`
    <div class="modal-title">高考即将开始</div>
    <div class="event-box" style="margin-bottom:12px;line-height:1.8">
      三年的高中旅程已经走到最后一程。<br>
      做好准备后，你将正式进入高考考场。
    </div>
  `, callback)
}

function startGaokao() {
  const subjects = player.selectedSubjects || [...CORE_SUBJECTS, ...ELECTIVE_SUBJECTS.slice(0, 3)]
  const questions = []
  subjects.forEach(subj => {
    const bank = QUIZ_BANK[subj] || []
    shuffle([...bank]).slice(0, 3).forEach(q => questions.push({ ...q, subject: subj }))
  })
  currentGaokao = {
    questions,
    answers: new Array(questions.length).fill(-1),
    submitted: false,
    queryAttempts: 0,
    queryCompleted: false,
    queryNameInput: player.name || '',
    queryPasswordInput: '',
    querySystemNotice: '',
    queryPromptShown: false,
  }
  currentPage = 'home'
  saveState()
  document.getElementById('bottom-nav').classList.add('hidden')
  renderGaokaoExam()
}

function renderGaokaoExam() {
  scrollToTop()
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
  saveState()
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
  const loverBonus = hasLoverClassmate() ? 10 : 0
  const confidantBonus = getBondedClassmates().length >= 2 ? 10 : 0
  const mentorBonus = getBondedTeachers().length >= 2 ? 10 : 0
  const baseScore = Math.round(Math.max(200, Math.min(680, rawBase * 480 + 200)))
  const rawScore = Math.round(Math.max(200, Math.min(710, baseScore + qiangjiBonus + loverBonus + confidantBonus + mentorBonus)))

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
  ex.loverBonus      = loverBonus
  ex.confidantBonus  = confidantBonus
  ex.mentorBonus     = mentorBonus
  player.gaokaoResult = { rawScore, perfKey, finalScore, loverBonus, confidantBonus, mentorBonus }
  saveState()

  showModal(`
    <div class="modal-title">高考发挥</div>
    <div style="text-align:center;padding:20px 0 14px">
      <div style="font-size:30px;font-weight:900;color:${perf.color};letter-spacing:2px">${perfKey}</div>
      <div style="font-size:20px;font-weight:700;color:${perf.color};margin-top:10px">
        ${perf.delta !== 0 ? (perf.delta > 0 ? '+' : '') + perf.delta + ' 分' : '分数不变'}
      </div>
    </div>
    <div class="event-box">${perf.desc}</div>
  `, () => {
    showGaokaoMemorialScene(() => {
      ex.queryPromptShown = true
      saveState()
      showGaokaoScoreQueryIntro(() => showGaokaoScoreQueryForm())
    })
  })
}

function renderGaokaoQueryPending() {
  const c = document.getElementById('content')
  c.innerHTML = `
    <div class="card gaokao-result-card">
      <div class="gaokao-result-label">📨 高考后续流程</div>
      <div class="gaokao-school-name" style="font-size:30px">高考分数查询</div>
      <div class="gaokao-desc">考试已经结束，查询入口已经开放。请核对姓名和报名密码后查询成绩。</div>
      <button class="btn btn-primary full-width" style="margin-top:16px" onclick="showGaokaoScoreQueryIntro(() => showGaokaoScoreQueryForm())">进入查询</button>
    </div>
  `
}

function getGaokaoMemorialCopy() {
  const dominant = getDominantJourneyCategory()
  const copies = {
    social: '这三年里\n你把很多精力\n都留给了人与人之间的联结\n那些并肩走过的课间\n深夜聊过的心事\n还有一句句“没事，我在”\n都成了今天回头时\n最柔软的光',
    study: '这三年里\n你把最多的精力\n埋进了一页页试卷和笔记里\n草稿纸堆成山\n错题改了又改\n那些看似枯燥的日夜\n最终都化成了此刻\n落在手心里的重量',
    activity: '这三年里\n你没有只把自己\n交给题海和排名\n你也认真地奔跑过\n大笑过 出汗过 透过气\n那些离开课桌的时刻\n让你在走到今天时\n仍然像一个鲜活的人',
  }
  return copies[dominant] || copies.study
}

function showHandwrittenScene(fullText, callback, decoText = '水 衡') {
  const overlay = document.getElementById('intro-overlay')
  const textEl = document.getElementById('intro-text')
  const hintEl = document.getElementById('intro-hint')
  const decoEl = document.querySelector('.intro-deco')
  const toHtml = (text) => text.replace(/\n/g, '<br>')

  if (decoEl) decoEl.textContent = decoText
  overlay.classList.add('active')
  textEl.innerHTML = ''
  hintEl.className = 'intro-hint'

  let idx = 0
  let done = false

  function finishTyping() {
    if (_introTimer) {
      clearInterval(_introTimer)
      _introTimer = null
    }
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
      return
    }
    overlay.classList.remove('active')
    callback?.()
  }
}

function showGaokaoMemorialScene(callback) {
  const text = getGaokaoMemorialCopy()
  showHandwrittenScene(text, callback, '高 考')
}

function showGaokaoScoreQueryIntro(callback) {
  showModal(`
    <div class="modal-title">高考分数查询</div>
    <div class="event-box" style="margin-bottom:12px;line-height:1.8">
      高考成绩查询通道已开放。<br>
      请输入报名时登记的姓名和密码，进入成绩查询系统。
    </div>
  `, callback)
}

function showGaokaoScoreQueryForm() {
  if (!currentGaokao) return
  const ex = currentGaokao
  const systemNoticeHtml = ex.querySystemNotice
    ? `
      <div class="gaokao-query-notice">
        <div class="gaokao-query-notice-title">系统提示</div>
        <div>${escapeHtml(ex.querySystemNotice)}</div>
      </div>
    `
    : ''

  showModal(`
    <div class="gaokao-reg-system">
      <div class="gaokao-reg-topbar">山河省普通高校招生考试成绩查询系统</div>
      <div class="gaokao-reg-title">考生成绩查询</div>
      ${systemNoticeHtml}

      <div class="gaokao-reg-field">
        <label class="gaokao-reg-label">姓名</label>
        <input id="gaokao-query-name" class="gaokao-reg-input" type="text" maxlength="12" value="${escapeHtml(ex.queryNameInput || '')}" placeholder="请输入报名姓名">
      </div>

      <div class="gaokao-reg-field">
        <label class="gaokao-reg-label">密码</label>
        <input id="gaokao-query-password" class="gaokao-reg-input" type="password" maxlength="20" value="${escapeHtml(ex.queryPasswordInput || '')}" placeholder="请输入报名密码">
      </div>

      <div id="gaokao-query-error" class="gaokao-reg-error"></div>

      <button class="btn btn-primary full-width gaokao-reg-submit" onclick="submitGaokaoScoreQuery()">确认查询</button>
    </div>
  `, null, true, true)

  setTimeout(() => {
    const target = ex.queryPasswordInput ? document.getElementById('gaokao-query-password') : document.getElementById('gaokao-query-name')
    target?.focus()
  }, 0)
}

function submitGaokaoScoreQuery() {
  if (!currentGaokao) return

  const ex = currentGaokao
  const nameInput = document.getElementById('gaokao-query-name')
  const passwordInput = document.getElementById('gaokao-query-password')
  const errorEl = document.getElementById('gaokao-query-error')

  if (!nameInput || !passwordInput || !errorEl) return

  const queryName = nameInput.value.trim()
  const queryPassword = passwordInput.value

  ex.queryNameInput = queryName
  ex.queryPasswordInput = queryPassword
  saveState()

  if (!queryName) {
    errorEl.textContent = '请输入报名姓名。'
    nameInput.focus()
    return
  }

  if (!queryPassword) {
    errorEl.textContent = '请输入报名密码。'
    passwordInput.focus()
    return
  }

  if (queryName !== (player.name || '')) {
    errorEl.textContent = '姓名与报名信息不一致，请重新输入。'
    nameInput.focus()
    nameInput.select()
    return
  }

  if (queryPassword !== (player.gaokaoRegistrationPassword || '')) {
    errorEl.textContent = '密码错误，请核对后重新查询。'
    passwordInput.focus()
    passwordInput.select()
    return
  }

  ex.queryAttempts = (ex.queryAttempts || 0) + 1
  saveState()

  if (ex.queryAttempts === 1) {
    ex.querySystemNotice = '当前查询人数过多，无法查询，请稍后再试。'
    saveState()
    showGaokaoScoreQueryForm()
    return
  }

  ex.querySystemNotice = ''
  ex.queryCompleted = true
  saveState()
  document.getElementById('modal-overlay').classList.add('hidden')
  document.getElementById('modal-ok').style.display = ''
  _modalNoDismiss = false
  _modalCb = null
  renderGaokaoResult()
}

function renderGaokaoResult() {
  syncNavigationLockUI()
  const c    = document.getElementById('content')
  const data = currentGaokao?.finalScore ? currentGaokao : player.gaokaoResult
  if (!data) { c.innerHTML = renderGraduation(); return }

  const { finalScore, rawScore, perfKey, loverBonus = 0, confidantBonus = 0, mentorBonus = 0 } = data
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
      ${loverBonus > 0 ? `<div class="info-row"><span class="muted">💞 比翼双飞加成</span><span class="info-val" style="color:#ef6aa8">+10</span></div>` : ''}
      ${confidantBonus > 0 ? `<div class="info-row"><span class="muted">🤝 同舟共济加成</span><span class="info-val" style="color:#4d9fd4">+10</span></div>` : ''}
      ${mentorBonus > 0 ? `<div class="info-row"><span class="muted">🎓 良师益友加成</span><span class="info-val" style="color:#c9952a">+10</span></div>` : ''}
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
  const playerName = ((player.name || '').trim() || '你')

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = 540, H = 800
  const cv = document.createElement('canvas')
  cv.width  = W * dpr
  cv.height = H * dpr
  const ctx = cv.getContext('2d')
  ctx.scale(dpr, dpr)

  const font = (size, weight) => `${weight || '500'} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`
  const drawCenteredText = (text, y, size, color, weight = '500') => {
    ctx.fillStyle = color
    ctx.font = font(size, weight)
    ctx.fillText(text, W / 2, y)
  }
  const drawWrappedText = (text, x, y, maxW, lineH) => {
    let line = ''
    for (const ch of text) {
      const test = line + ch
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(line, x, y)
        line = ch
        y += lineH
      } else line = test
    }
    if (line) ctx.fillText(line, x, y)
  }

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#fbf8f2')
  bg.addColorStop(1, '#f2ece1')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#3d5a4c'
  ctx.fillRect(0, 0, W, 8)
  ctx.fillRect(0, H - 8, W, 8)
  ctx.strokeStyle = '#d7cfbf'
  ctx.lineWidth = 1.4
  ctx.strokeRect(24, 24, W - 48, H - 48)
  ctx.strokeRect(36, 36, W - 72, H - 72)
  ctx.strokeStyle = '#3d5a4c55'
  ;[
    [52, 52, 16, 16],
    [W - 52, 52, -16, 16],
    [52, H - 52, 16, -16],
    [W - 52, H - 52, -16, -16],
  ].forEach(([x, y, dx, dy]) => {
    ctx.beginPath()
    ctx.moveTo(x, y + dy)
    ctx.lineTo(x, y)
    ctx.lineTo(x + dx, y)
    ctx.stroke()
  })
  ctx.fillStyle = '#3d5a4c'
  ;[W / 2 - 84, W / 2 - 56, W / 2 - 28, W / 2 + 28, W / 2 + 56, W / 2 + 84].forEach(x => {
    ctx.beginPath()
    ctx.arc(x, 118, 2, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.textAlign = 'center'

  drawCenteredText('水 衡 高 中', 60, 16, '#8a8479', '600')
  drawCenteredText('普通高等学校招生全国统一考试', 90, 17, '#2a2925', 'bold')
  ctx.strokeStyle = '#e2ddd5'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(54, 136)
  ctx.lineTo(W - 54, 136)
  ctx.stroke()
  drawCenteredText(`${playerName}的高考成绩`, 178, 28, '#2a2925', '900')
  drawCenteredText('GAOKAO SCORE REPORT', 208, 13, '#9a9488', '600')

  ctx.fillStyle = '#3d5a4c'
  ctx.font = font(100, '900')
  ctx.fillText(finalScore + ' 分', W / 2, 304)

  ctx.beginPath()
  ctx.moveTo(54, 334)
  ctx.lineTo(W - 54, 334)
  ctx.stroke()

  ctx.fillStyle = perf.color
  ctx.font = font(24, 'bold')
  ctx.fillText(perfKey + (perf.delta !== 0 ? `（${perf.delta > 0 ? '+' : ''}${perf.delta}）` : ''), W / 2, 382)

  ctx.fillStyle = '#2a2925'
  ctx.font = font(44, '900')
  ctx.fillText(`🎓 ${tier.school} 🎓`, W / 2, 456)

  drawCenteredText(tier.badge, 490, 16, '#8a8479', '600')
  ctx.beginPath()
  ctx.moveTo(54, 518)
  ctx.lineTo(W - 54, 518)
  ctx.stroke()
  ctx.fillStyle = '#5a5650'
  ctx.font = font(16)
  ctx.textAlign = 'left'
  drawWrappedText(tier.desc, 56, 560, W - 112, 30)

  ctx.textAlign = 'center'
  ctx.strokeStyle = '#d7cfbf'
  ctx.beginPath()
  ctx.moveTo(116, 690)
  ctx.lineTo(220, 690)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(W - 116, 690)
  ctx.lineTo(W - 220, 690)
  ctx.stroke()
  drawCenteredText('✦', 695, 16, '#b8b3aa', '700')
  ctx.fillStyle = '#b8b3aa'
  ctx.font = font(13, '600')
  ctx.fillText('水衡高中模拟器', W / 2, H - 54)
  ctx.font = font(12, '500')
  ctx.fillText('start.sh-simulatior.fun', W / 2, H - 32)

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
  scrollToTop()
  syncNavigationLockUI()
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
  const playerName = ((player.name || '').trim() || '你')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = 540, H = 800
  const cv = document.createElement('canvas')
  cv.width  = W * dpr
  cv.height = H * dpr
  const ctx = cv.getContext('2d')
  ctx.scale(dpr, dpr)

  const font = (size, weight) => `${weight || '500'} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`
  const drawCenteredText = (text, y, size, color, weight = '500') => {
    ctx.fillStyle = color
    ctx.font = font(size, weight)
    ctx.fillText(text, W / 2, y)
  }
  const drawWrappedText = (text, x, y, maxW, lineH) => {
    let line = ''
    for (const ch of text) {
      const test = line + ch
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(line, x, y)
        line = ch
        y += lineH
      } else line = test
    }
    if (line) ctx.fillText(line, x, y)
  }

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#fff9ea')
  bg.addColorStop(1, '#f8e8b4')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#c9952a'
  ctx.fillRect(0, 0, W, 8)
  ctx.fillRect(0, H - 8, W, 8)

  ctx.strokeStyle = '#c9952a44'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(20, 20)
  ctx.lineTo(20, H - 20)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(W - 20, 20)
  ctx.lineTo(W - 20, H - 20)
  ctx.stroke()
  ctx.strokeStyle = '#e2c46d'
  ctx.strokeRect(34, 34, W - 68, H - 68)
  ctx.strokeRect(48, 48, W - 96, H - 96)
  ctx.strokeStyle = '#c9952a55'
  ;[
    [62, 62, 16, 16],
    [W - 62, 62, -16, 16],
    [62, H - 62, 16, -16],
    [W - 62, H - 62, -16, -16],
  ].forEach(([x, y, dx, dy]) => {
    ctx.beginPath()
    ctx.moveTo(x, y + dy)
    ctx.lineTo(x, y)
    ctx.lineTo(x + dx, y)
    ctx.stroke()
  })
  ctx.fillStyle = '#c9952a'
  ;[[72, 72], [W - 72, 72], [72, H - 72], [W - 72, H - 72]].forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.textAlign = 'center'

  drawCenteredText('✨  隐 藏 结 局 解 锁  ✨', 56, 13, '#c9952a', '700')
  drawCenteredText('惊 天 奇 才', 114, 42, '#8b6000', '900')
  drawCenteredText(`${playerName}的高考成绩`, 152, 24, '#7a5608', '800')
  ctx.strokeStyle = '#c9952a66'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 176)
  ctx.lineTo(W - 80, 176)
  ctx.stroke()

  ctx.fillStyle = '#5a3a00'
  ctx.font = font(50, '900')
  ctx.fillText(`🏛️ ${school} 🏛️`, W / 2, 258)

  drawCenteredText('全国奥林匹克竞赛满分得主', 300, 16, '#c9952a', '700')
  ctx.strokeStyle = '#c9952a44'
  ctx.beginPath()
  ctx.moveTo(60, 328)
  ctx.lineTo(W - 60, 328)
  ctx.stroke()
  ctx.font = font(76)
  ctx.fillText('🏆', W / 2, 420)
  ctx.beginPath()
  ctx.moveTo(60, 452)
  ctx.lineTo(W - 60, 452)
  ctx.stroke()

  ctx.font = font(16)
  ctx.textAlign = 'left'
  const stats = [
    ['触发时间', '高二 · 5月'],
    ['学习进度', String(player.learning)],
    ['心理健康', String(player.mental)],
    ['身体健康', String(player.health)],
  ]
  let sy = 496
  stats.forEach(([label, val]) => {
    ctx.fillStyle = '#a07820'
    ctx.fillText(label, 60, sy)
    ctx.fillStyle = '#5a3a00'
    ctx.textAlign = 'right'
    ctx.fillText(val, W - 60, sy)
    ctx.textAlign = 'left'
    sy += 38
  })

  ctx.fillStyle = '#a07820'
  ctx.font = font(14)
  ctx.textAlign = 'left'
  const desc = '以无可争辩的实力震惊全场，高中旅程以最耀眼的方式画上句号'
  drawWrappedText(desc, 60, sy + 24, W - 120, 28)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#c9b06a'
  ctx.font = font(13, '600')
  ctx.fillText('水衡高中模拟器', W / 2, H - 54)
  ctx.font = font(12, '500')
  ctx.fillText('start.sh-simulatior.fun', W / 2, H - 32)

  cv.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `惊天奇才_${school}.png`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

