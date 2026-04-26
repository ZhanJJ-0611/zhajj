/* ============================================================
   Esports Recruitment
   ============================================================ */

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
  currentPage = 'home'
  saveState()
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === 'home'))
  document.getElementById('content').innerHTML = ''
  renderEsportsExam()
}

function renderEsportsExam() {
  scrollToTop()
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
  saveState()
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
  scrollToTop()
  syncNavigationLockUI()
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
  ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(20, H - 20); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W - 20, 20); ctx.lineTo(W - 20, H - 20); ctx.stroke()
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

  drawCenteredText('为 热 爱 正 名', 114, 40, '#8b6000', '900')
  drawCenteredText(`${playerName}的录取结果`, 152, 24, '#7a5608', '800')

  ctx.strokeStyle = '#c9952a66'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, 176); ctx.lineTo(W - 80, 176); ctx.stroke()

  ctx.fillStyle = '#5a3a00'
  ctx.font = font(48, '900')
  ctx.fillText(`🎮 ${project} 🎮`, W / 2, 258)

  drawCenteredText('GNR电竞俱乐部 · 招募通过', 300, 16, '#c9952a', '700')

  ctx.strokeStyle = '#c9952a44'
  ctx.beginPath(); ctx.moveTo(60, 328); ctx.lineTo(W - 60, 328); ctx.stroke()

  ctx.font = font(76)
  ctx.fillText('🏆', W / 2, 420)

  ctx.strokeStyle = '#c9952a44'
  ctx.beginPath(); ctx.moveTo(60, 452); ctx.lineTo(W - 60, 452); ctx.stroke()

  ctx.font = font(16)
  ctx.textAlign = 'left'
  const stats = [
    ['触发时间', '高二 · 5月'],
    ['电竞项目', project],
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
  drawWrappedText('没有人天生擅长，只是比别人更热爱。你的高中旅程，最终在另一条赛道上闪闪发光。', 60, sy + 24, W - 120, 28)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#c9b06a'
  ctx.font = font(13, '600')
  ctx.fillText('水衡高中模拟器', W / 2, H - 54)
  ctx.font = font(12, '500')
  ctx.fillText('start.sh-simulatior.fun', W / 2, H - 32)

  cv.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `为热爱正名_${project}.png`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
