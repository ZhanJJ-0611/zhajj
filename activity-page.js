/* ============================================================
   Activity Page
   ============================================================ */

// ─── 娱乐页面 ────────────────────────────────────────────────

function renderFun() {
  scrollToTop()
  const c = document.getElementById('content')
  const calMonth = getMonthInfo(player.month).month
  const isVacation = [2, 7, 8].includes(calMonth)
  const used = key => (player.usedActivities || []).includes(key)
  const partTimeGame = isVacation ?         `
        <div class="game-card${used('parttime') ? ' game-card--used' : ''}" onclick="${used('parttime') ? '' : 'startLinkGame()'}">
          <div class="game-icon">💼</div>
          <div class="game-name">打工</div>
          <div class="game-cost">消耗 2 精力</div>
          <div class="game-eff">收益 +500 元</div>
        </div>` : ''
  c.innerHTML =     `
    <div class="card">
      <div class="card-label">活动页面</div>
      <div class="game-grid">
        ${GAMES.map(g =>           `
          <div class="game-card${used(g.key) ? ' game-card--used' : ''}" onclick="${used(g.key) ? '' : g.fn}">
            <div class="game-icon">${g.icon}</div>
            <div class="game-name">${g.name}</div>
            <div class="game-cost">消耗 ${g.cost}</div>
            <div class="game-eff">效果 ${g.eff}</div>
          </div>
        `).join('')}
        ${partTimeGame}
      </div>
    </div>
  `
}

function getActivityScoreMeta(key) {
  return {
    running: { name: '跑步', scoreLabel: '历史最高距离', unit: '米' },
    basketball: { name: '篮球', scoreLabel: '历史最高进球', unit: '球' },
    swimming: { name: '游泳', scoreLabel: '历史最高距离', unit: '米' },
    breakout: { name: '乒乓球', scoreLabel: '历史最高得分', unit: '分' },
    skyfight: { name: '电子游戏', scoreLabel: '历史最高得分', unit: '分' },
    parttime: { name: '打工', scoreLabel: '历史最高收入', unit: '元' },
  }[key] || { name: key, scoreLabel: '历史最高成绩', unit: '' }
}

function getActivityBestScore(key) {
  return Number(player.activityBestScores?.[key] || 0)
}

function rememberActivityBestScore(key, score) {
  const nextScore = Math.max(0, Math.round(Number(score) || 0))
  const bestScore = getActivityBestScore(key)
  if (nextScore <= bestScore) return bestScore

  player.activityBestScores = player.activityBestScores || {}
  player.activityBestScores[key] = nextScore
  saveState()
  return nextScore
}

function closeActivityBestScorePrompt() {
  window._activityBestReplay = null
  window._activityBestQuickFinish = null
  document.getElementById('modal-overlay').classList.add('hidden')
  _modalNoDismiss = false
  _modalCb = null
}

function showActivityBestScorePrompt(key, onReplay, onQuickFinish) {
  const bestScore = getActivityBestScore(key)
  if (bestScore <= 0) {
    onReplay()
    return
  }

  const meta = getActivityScoreMeta(key)
  window._activityBestReplay = () => {
    closeActivityBestScorePrompt()
    onReplay()
  }
  window._activityBestQuickFinish = () => {
    closeActivityBestScorePrompt()
    onQuickFinish(bestScore)
  }

  showModal(`
    <div class="modal-title">${meta.name}</div>
    <div class="event-box" style="margin-bottom:12px">
      你在这个项目里已经创造过不错的成绩。
      这次可以选择重新挑战，也可以直接按历史最高成绩一键通关。
    </div>
    <div class="card-sub-label" style="text-align:center;margin-bottom:14px">
      ${meta.scoreLabel}：${bestScore} ${meta.unit}
    </div>
    <button class="btn full-width" style="margin-bottom:8px" onclick="window._activityBestReplay()">重新挑战</button>
    <button class="btn btn-primary full-width" onclick="window._activityBestQuickFinish()">一键通关</button>
  `, null, true, true)
}

function startScoredActivity(options) {
  const { key, tutorialKey = key, energyCost = 1, onReplay, onQuickFinish } = options

  showGameTutorial(tutorialKey, () => {
    if (player.monthStarted) {
      const currentEnergy = player.energy ?? 0
      if (currentEnergy < energyCost) {
        showModal('<div class="modal-title">精力不足</div><p class="muted tc" style="padding:4px 0 8px">当前精力不够，无法进行这项活动。</p>')
        return
      }
      for (let i = 0; i < energyCost; i++) {
        if (!useEnergy('activity')) return
      }
    }
    markActivityUsed(key)
    if (currentPage === 'fun') renderFun()
    showActivityBestScorePrompt(key, onReplay, onQuickFinish)
  })
}

function getActivityScoreMeta(key) {
  return {
    running: { name: '跑步', scoreLabel: '历史最高距离', unit: '米' },
    basketball: { name: '篮球', scoreLabel: '历史最高进球', unit: '球' },
    swimming: { name: '游泳', scoreLabel: '历史最高距离', unit: '米' },
    breakout: { name: '乒乓球', scoreLabel: '历史最高得分', unit: '分' },
    skyfight: { name: '电子游戏', scoreLabel: '历史最高得分', unit: '分' },
    parttime: { name: '打工', scoreLabel: '历史最高收入', unit: '元' },
  }[key] || { name: key, scoreLabel: '历史最高成绩', unit: '' }
}

function showActivityBestScorePrompt(key, onReplay, onQuickFinish) {
  const bestScore = getActivityBestScore(key)
  if (bestScore <= 0) {
    onReplay()
    return
  }

  const meta = getActivityScoreMeta(key)
  window._activityBestReplay = () => {
    closeActivityBestScorePrompt()
    onReplay()
  }
  window._activityBestQuickFinish = () => {
    closeActivityBestScorePrompt()
    onQuickFinish(bestScore)
  }

  showModal(`
    <div class="modal-title">${meta.name}</div>
    <div class="event-box" style="margin-bottom:12px">
      你在这个项目里已经创造过不错的成绩。
      这次可以选择重新挑战，也可以直接按历史最高成绩一键通关。
    </div>
    <div class="card-sub-label" style="text-align:center;margin-bottom:14px">
      ${meta.scoreLabel}：${bestScore} ${meta.unit}
    </div>
    <button class="btn full-width" style="margin-bottom:8px" onclick="window._activityBestReplay()">重新挑战</button>
    <button class="btn btn-primary full-width" onclick="window._activityBestQuickFinish()">一键通关</button>
  `, null, true, true)
}

function startScoredActivity(options) {
  const { key, tutorialKey = key, energyCost = 1, onReplay, onQuickFinish } = options

  showGameTutorial(tutorialKey, () => {
    if (player.monthStarted) {
      const currentEnergy = player.energy ?? 0
      if (currentEnergy < energyCost) {
        showModal('<div class="modal-title">精力不足</div><p class="muted tc" style="padding:4px 0 8px">当前精力不够，无法进行这项活动。</p>')
        return
      }
      for (let i = 0; i < energyCost; i++) {
        if (!useEnergy('activity')) return
      }
    }
    markActivityUsed(key)
    if (currentPage === 'fun') renderFun()
    showActivityBestScorePrompt(key, onReplay, onQuickFinish)
  })
}

function showComingSoon(name) {
  showModal(`<div class="modal-title">${name}</div><p class="muted tc">这个内容还在制作中，敬请期待。</p>`)
}

function buySnacks() {
  if (player.money < 200) {
    showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">买零食需要 200 元，当前余额不足。</p>`)
    return
  }
  tryShopInvite('🍿 买零食', 200,
    () => {
      markActivityUsed('snacks')
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
      markActivityUsed('snacks')
      applyChanges({ money: -300, mental: 10 })
      addClassmateAffinity(rel, 20)
      const justBonded = unlockClassmateBond(rel)
      saveState()
      showModal(`
        <div class="modal-title">🍿 一起买零食 🎉</div>
        <div class="event-box" style="font-size:13px;margin-bottom:12px;">和 ${def.name} 一起逛小卖部，挑了好多好吃的，边吃边聊，笑声不断，心情超好！</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-300</span></div>
        <div class="modal-row"><span>心理健康</span><span class="chg-pos">+10</span></div>
        <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="chg-pos">+20</span></div>
      `, () => handleClassmateAffinityMilestone(rel, def, justBonded, () => {}))
    }
  )
}

function getMassage() {
  if (player.money < 500) {
    showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">理疗需要 500 元，当前余额不足。</p>`)
    return
  }
  tryShopInvite('💆 理疗', 500,
    () => {
      markActivityUsed('massage')
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
      markActivityUsed('massage')
      applyChanges({ money: -750, health: 20 })
      addClassmateAffinity(rel, 20)
      const justBonded = unlockClassmateBond(rel)
      saveState()
      showModal(`
        <div class="modal-title">💆 一起理疗 🎉</div>
        <div class="event-box" style="font-size:13px;margin-bottom:12px;">和 ${def.name} 一起预约了理疗，两人躺着聊天，放松身心，关系也更近了一步！</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-750</span></div>
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+20</span></div>
        <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="chg-pos">+20</span></div>
      `, () => handleClassmateAffinityMilestone(rel, def, justBonded, () => {}))
    }
  )
}

// 买零食/理疗专用邀约：20% 触发，1.5x 费用，仅正面结果，好感+20
function tryShopInvite(title, baseCost, soloFn, togetherFn) {
  const availableClassmates = getInteractableClassmates()
  if (!player.monthStarted || Math.random() >= 0.2 || availableClassmates.length === 0) {
    soloFn(); return
  }
  const rel = availableClassmates[rndInt(availableClassmates.length)]
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
    <div class="modal-title">同学邀约</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      ${def.emoji} <strong>${def.name}</strong> 想和你一起去${title.replace(/^[^\u4e00-\u9fa5A-Za-z]+/u, '').trim()}。<br>
      <span style="font-size:11px;color:var(--text-muted)">一起去需要花费 ${totalCost} 元，但有机会提升你们的好感度。</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="_declineShopInvite()">自己去</button>
      <button class="btn btn-primary full-width" onclick="_acceptShopInvite('${rel.id}')">一起去</button>
    </div>
  `, () => soloFn(), true)
}

function tryInvite(activityName, onDone) {
  const availableClassmates = getInteractableClassmates()
  if (!player.monthStarted || Math.random() >= 0.6 || availableClassmates.length === 0) {
    onDone(false); return
  }
  const rel = availableClassmates[rndInt(availableClassmates.length)]
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
    <div class="modal-title">同学邀约</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      ${def.emoji} <strong>${def.name}</strong> 想和你一起去玩${activityName}。<br>
      <span style="font-size:11px;color:var(--text-muted)">一起行动可能会影响心情、身体状态和你们的关系。</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="closeModal()">这次算了</button>
      <button class="btn btn-primary full-width" onclick="_acceptInvite('${rel.id}')">一起去</button>
    </div>
  `, () => onDone(false), true)
}

function applyInviteOutcome(rel, def, activityName, onDone) {
  const good   = Math.random() < 0.6
  const aff    = good ? (rndInt(6) + 4)  : -(rndInt(5) + 3)
  const mental = good ? (rndInt(4) + 4)  : -(rndInt(4) + 3)
  const health = good ? (rndInt(3) + 2)  : rndInt(2)

  const goodDescs = [
    `你和 ${def.name} 一起去玩${activityName}，过程很愉快，结束时还有点意犹未尽。`,
    `${def.name} 一路上都很放松健谈，这次${activityName}让你们熟络了不少。`,
    `这次${activityName}气氛很好，你玩得开心，和 ${def.name} 的关系也更近了。`,
  ]
  const badDescs = [
    `你和 ${def.name} 一起去玩${activityName}，但过程有些尴尬，没有想象中顺利。`,
    `${def.name} 这次状态一般，整个${activityName}过程都没太放得开。`,
    `这次${activityName}并没有带来太多快乐，你反而觉得有些疲惫。`,
  ]
  const desc = good ? goodDescs[rndInt(goodDescs.length)] : badDescs[rndInt(badDescs.length)]

  addClassmateAffinity(rel, aff)
  const justBonded = unlockClassmateBond(rel)
  applyChanges({ mental, health })
  saveState()

  showModal(`
    <div class="modal-title">${good ? '邀约顺利' : '邀约一般'}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${desc}</div>
    <hr class="modal-divider">
    <div class="modal-row"><span>心理健康</span><span class="${mental >= 0 ? 'chg-pos' : 'chg-neg'}">${mental >= 0 ? '+' : ''}${mental}</span></div>
    <div class="modal-row"><span>身体健康</span><span class="${health > 0 ? 'chg-pos' : 'chg-neg'}">${health > 0 ? '+' : ''}${health}</span></div>
    <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff >= 0 ? 'chg-pos' : 'chg-neg'}">${aff >= 0 ? '+' : ''}${aff}</span></div>
  `, () => handleClassmateAffinityMilestone(rel, def, justBonded, onDone))
}

// ─── 跑步游戏 ────────────────────────────────────────────────

function setSnakeDir(dx, dy) {
  if (dx === -snakeCurDir.x && dy === -snakeCurDir.y) return
  snakeNextDir = { x: dx, y: dy }
}

function startRunning() {
  startScoredActivity({
    key: 'running',
    onReplay: () => {
      tryInvite('跑步', () => openRunningGame())
    },
    onQuickFinish: (bestScore) => {
      settleRunningResult(bestScore)
    },
  })
}

function startRunning() {
  startScoredActivity({
    key: 'running',
    onReplay: () => {
      tryInvite('跑步', () => openRunningGame())
    },
    onQuickFinish: (bestScore) => {
      settleRunningResult(bestScore)
    },
  })
}

function getRunningHealthGain(dist) {
  return Math.round(Math.min(dist, 1000) / 1000 * 15)
}

function settleRunningResult(dist, options = {}) {
  const { fromGame = false } = options
  const hgain = getRunningHealthGain(dist)
  rememberActivityBestScore('running', dist)
  if (player.monthStarted) applyChanges({ health: hgain })

  const showResult = () => {
    if (player.monthStarted) {
      showModal(`
        <div class="modal-title">跑步结束</div>
        <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0;">${dist}<span style="font-size:15px;font-weight:500;color:var(--text-muted)"> 米</span></div>
        <hr class="modal-divider">
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hgain}</span></div>
      `)
    }
  }

  if (!fromGame) {
    showResult()
    return
  }

  setTimeout(() => {
    closeGame()
    showResult()
  }, 1600)
}

function startRunning() {
  startScoredActivity({
    key: 'running',
    onReplay: () => {
      tryInvite('跑步', () => openRunningGame())
    },
    onQuickFinish: (bestScore) => {
      settleRunningResult(bestScore)
    },
  })
}

function settleRunningResult(dist, options = {}) {
  const { fromGame = false } = options
  const hgain = getRunningHealthGain(dist)
  rememberActivityBestScore('running', dist)
  if (player.monthStarted) applyChanges({ health: hgain })

  const showResult = () => {
    if (player.monthStarted) {
      showModal(`
        <div class="modal-title">跑步结束</div>
        <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0;">${dist}<span style="font-size:15px;font-weight:500;color:var(--text-muted)"> 米</span></div>
        <hr class="modal-divider">
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hgain}</span></div>
      `)
    }
  }

  if (!fromGame) {
    showResult()
    return
  }

  setTimeout(() => {
    closeGame()
    showResult()
  }, 1600)
}

function openRunningGame() {
  const overlay = document.getElementById('game-overlay')
  const canvas  = document.getElementById('game-canvas')
  const info    = document.getElementById('game-info')
  const ctx     = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '跑步'
  overlay.classList.remove('hidden')
  info.textContent = '吃到补给，跑得更远'

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
    ctx.fillText(`距离 ${score * 50} 米`, 5, 14)
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
    const dist = score * 50
    info.textContent = `本次跑了 ${dist} 米`
    settleRunningResult(dist, { fromGame: true })
  }

  const onKey = (e) => {
    const map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] }
    const d = map[e.key]
    if (d) { setSnakeDir(d[0], d[1]); e.preventDefault() }
  }
  document.addEventListener('keydown', onKey)

  let touchSt = null
  const onTouchStart = e => {
    touchSt = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = e => {
    if (!touchSt) return
    const dx = e.changedTouches[0].clientX - touchSt.x
    const dy = e.changedTouches[0].clientY - touchSt.y
    if (Math.abs(dx) > Math.abs(dy)) setSnakeDir(dx > 0 ? 1 : -1, 0)
    else                              setSnakeDir(0, dy > 0 ? 1 : -1)
    touchSt = null
  }
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  draw()
  restartTimer()

  snakeHandle = {
    stop: () => {
      clearInterval(timer)
      document.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }
}

function closeGame() {
  document.getElementById('game-overlay').classList.add('hidden')
  document.getElementById('game-info').textContent = ''
  if (snakeHandle) { snakeHandle.stop(); snakeHandle = null }
}

function renderFun() {
  scrollToTop()
  const c = document.getElementById('content')
  const calMonth = getMonthInfo(player.month).month
  const isVacation = [2, 7, 8].includes(calMonth)
  const used = key => (player.usedActivities || []).includes(key)
  const partTimeGame = isVacation
    ? `
        <div class="game-card${used('parttime') ? ' game-card--used' : ''}" onclick="${used('parttime') ? '' : 'startLinkGame()'}">
          <div class="game-icon">💼</div>
          <div class="game-name">打工</div>
          <div class="game-cost">消耗 2 精力</div>
          <div class="game-eff">最高 +500 零花钱</div>
        </div>`
    : ''

  c.innerHTML = `
    <div class="card">
      <div class="card-label">活动页面</div>
      <div class="game-grid">
        ${GAMES.map(g => `
          <div class="game-card${used(g.key) ? ' game-card--used' : ''}" onclick="${used(g.key) ? '' : g.fn}">
            <div class="game-icon">${g.icon}</div>
            <div class="game-name">${g.name}</div>
            <div class="game-cost">消耗 ${g.cost}</div>
            <div class="game-eff">效果 ${g.eff}</div>
          </div>
        `).join('')}
        ${partTimeGame}
      </div>
    </div>
  `
}

function getActivityScoreMeta(key) {
  return {
    running: { name: '跑步', scoreLabel: '历史最高距离', unit: '米' },
    basketball: { name: '篮球', scoreLabel: '历史最高进球', unit: '球' },
    swimming: { name: '游泳', scoreLabel: '历史最高距离', unit: '米' },
    breakout: { name: '乒乓球', scoreLabel: '历史最高得分', unit: '分' },
    skyfight: { name: '电子游戏', scoreLabel: '历史最高得分', unit: '分' },
    parttime: { name: '打工', scoreLabel: '历史最高收入', unit: '元' },
  }[key] || { name: key, scoreLabel: '历史最高成绩', unit: '' }
}

function showActivityBestScorePrompt(key, onReplay, onQuickFinish) {
  const bestScore = getActivityBestScore(key)
  if (bestScore <= 0) {
    onReplay()
    return
  }

  const meta = getActivityScoreMeta(key)
  window._activityBestReplay = () => {
    closeActivityBestScorePrompt()
    onReplay()
  }
  window._activityBestQuickFinish = () => {
    closeActivityBestScorePrompt()
    onQuickFinish(bestScore)
  }

  showModal(`
    <div class="modal-title">${meta.name}</div>
    <div class="event-box" style="margin-bottom:12px">
      你在这个项目里已经创造过不错的成绩。
      这次可以选择重新挑战，也可以直接按历史最高成绩一键通关。
    </div>
    <div class="card-sub-label" style="text-align:center;margin-bottom:14px">
      ${meta.scoreLabel}：${bestScore} ${meta.unit}
    </div>
    <button class="btn full-width" style="margin-bottom:8px" onclick="window._activityBestReplay()">重新挑战</button>
    <button class="btn btn-primary full-width" onclick="window._activityBestQuickFinish()">一键通关</button>
  `, null, true, true)
}

function startScoredActivity(options) {
  const { key, tutorialKey = key, energyCost = 1, onReplay, onQuickFinish } = options

  showGameTutorial(tutorialKey, () => {
    if (player.monthStarted) {
      const currentEnergy = player.energy ?? 0
      if (currentEnergy < energyCost) {
        showModal('<div class="modal-title">精力不足</div><p class="muted tc" style="padding:4px 0 8px">当前精力不够，无法进行这项活动。</p>')
        return
      }
      for (let i = 0; i < energyCost; i++) {
        if (!useEnergy('activity')) return
      }
    }
    markActivityUsed(key)
    if (currentPage === 'fun') renderFun()
    showActivityBestScorePrompt(key, onReplay, onQuickFinish)
  })
}

function showComingSoon(name) {
  showModal(`<div class="modal-title">${name}</div><p class="muted tc">这个内容还在制作中，敬请期待。</p>`)
}

function buySnacks() {
  if (player.money < 200) {
    showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">买零食需要 200 元，当前余额不足。</p>`)
    return
  }
  tryShopInvite('🍿 买零食', 200,
    () => {
      markActivityUsed('snacks')
      applyChanges({ money: -200, mental: 10 })
      saveState()
      showModal(`
        <div class="modal-title">🍿 买零食</div>
        <p style="font-size:13px;text-align:center;color:var(--text-muted);margin:8px 0 14px">买了一大袋零食，边吃边放松，心情一下子轻松了不少。</p>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-200</span></div>
        <div class="modal-row"><span>心理健康</span><span class="chg-pos">+10</span></div>
      `)
    },
    (rel, def) => {
      if (player.money < 300) {
        showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">和同学一起买零食需要 300 元，当前余额不足。</p>`)
        return
      }
      markActivityUsed('snacks')
      applyChanges({ money: -300, mental: 10 })
      addClassmateAffinity(rel, 20)
      const justBonded = unlockClassmateBond(rel)
      saveState()
      showModal(`
        <div class="modal-title">🍿 一起买零食</div>
        <div class="event-box" style="font-size:13px;margin-bottom:12px;">和 ${def.name} 一起逛小卖部，挑了不少好吃的，边吃边聊，关系也更近了一些。</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-300</span></div>
        <div class="modal-row"><span>心理健康</span><span class="chg-pos">+10</span></div>
        <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="chg-pos">+20</span></div>
      `, () => handleClassmateAffinityMilestone(rel, def, justBonded, () => {}))
    }
  )
}

function getMassage() {
  if (player.money < 500) {
    showModal(`<div class="modal-title">零花钱不足</div><p class="muted tc">理疗需要 500 元，当前余额不足。</p>`)
    return
  }
  tryShopInvite('💆 理疗', 500,
    () => {
      markActivityUsed('massage')
      applyChanges({ money: -500, health: 20 })
      saveState()
      showModal(`
        <div class="modal-title">💆 理疗</div>
        <p style="font-size:13px;text-align:center;color:var(--text-muted);margin:8px 0 14px">做了一次全身放松理疗，整个人都舒服了很多。</p>
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
      markActivityUsed('massage')
      applyChanges({ money: -750, health: 20 })
      addClassmateAffinity(rel, 20)
      const justBonded = unlockClassmateBond(rel)
      saveState()
      showModal(`
        <div class="modal-title">💆 一起理疗</div>
        <div class="event-box" style="font-size:13px;margin-bottom:12px;">和 ${def.name} 一起预约了理疗，边放松边聊天，身心都舒缓了不少。</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-neg">-750</span></div>
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+20</span></div>
        <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="chg-pos">+20</span></div>
      `, () => handleClassmateAffinityMilestone(rel, def, justBonded, () => {}))
    }
  )
}

function tryShopInvite(title, baseCost, soloFn, togetherFn) {
  const availableClassmates = getInteractableClassmates()
  if (!player.monthStarted || Math.random() >= 0.2 || availableClassmates.length === 0) {
    soloFn()
    return
  }
  const rel = availableClassmates[rndInt(availableClassmates.length)]
  const def = CLASSMATE_POOL.find(c => c.id === rel.id)
  if (!def) { soloFn(); return }

  const totalCost = Math.round(baseCost * 1.5)
  const cleanTitle = title.replace(/^[^\u4e00-\u9fa5A-Za-z]+/u, '').trim()

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
    <div class="modal-title">同学邀约</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      ${def.emoji} <strong>${def.name}</strong> 想和你一起去${cleanTitle}。<br>
      <span style="font-size:11px;color:var(--text-muted)">一起去需要花费 ${totalCost} 元，但有机会提升你们的好感度。</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="_declineShopInvite()">自己去</button>
      <button class="btn btn-primary full-width" onclick="_acceptShopInvite('${rel.id}')">一起去</button>
    </div>
  `, () => soloFn(), true)
}

function tryInvite(activityName, onDone) {
  const availableClassmates = getInteractableClassmates()
  if (!player.monthStarted || Math.random() >= 0.6 || availableClassmates.length === 0) {
    onDone(false)
    return
  }
  const rel = availableClassmates[rndInt(availableClassmates.length)]
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
    <div class="modal-title">同学邀约</div>
    <div class="event-box" style="font-size:13px;margin-bottom:14px;">
      ${def.emoji} <strong>${def.name}</strong> 想和你一起去玩${activityName}。<br>
      <span style="font-size:11px;color:var(--text-muted)">一起行动可能会影响心情、身体状态和你们的关系。</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn full-width" onclick="closeModal()">这次算了</button>
      <button class="btn btn-primary full-width" onclick="_acceptInvite('${rel.id}')">一起去</button>
    </div>
  `, () => onDone(false), true)
}

function applyInviteOutcome(rel, def, activityName, onDone) {
  const good = Math.random() < 0.6
  const aff = good ? (rndInt(6) + 4) : -(rndInt(5) + 3)
  const mental = good ? (rndInt(4) + 4) : -(rndInt(4) + 3)
  const health = good ? (rndInt(3) + 2) : rndInt(2)

  const goodDescs = [
    `你和 ${def.name} 一起去玩${activityName}，过程很愉快，结束时还有点意犹未尽。`,
    `${def.name} 一路上都很放松健谈，这次${activityName}让你们熟络了不少。`,
    `这次${activityName}气氛很好，你玩得开心，和 ${def.name} 的关系也更近了。`,
  ]
  const badDescs = [
    `你和 ${def.name} 一起去玩${activityName}，但过程有些尴尬，没有想象中顺利。`,
    `${def.name} 这次状态一般，整个${activityName}过程都没太放得开。`,
    `这次${activityName}并没有带来太多快乐，你反而觉得有些疲惫。`,
  ]
  const desc = good ? goodDescs[rndInt(goodDescs.length)] : badDescs[rndInt(badDescs.length)]

  addClassmateAffinity(rel, aff)
  const justBonded = unlockClassmateBond(rel)
  applyChanges({ mental, health })
  saveState()

  showModal(`
    <div class="modal-title">${good ? '邀约顺利' : '邀约一般'}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${desc}</div>
    <hr class="modal-divider">
    <div class="modal-row"><span>心理健康</span><span class="${mental >= 0 ? 'chg-pos' : 'chg-neg'}">${mental >= 0 ? '+' : ''}${mental}</span></div>
    <div class="modal-row"><span>身体健康</span><span class="${health > 0 ? 'chg-pos' : 'chg-neg'}">${health > 0 ? '+' : ''}${health}</span></div>
    <div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff >= 0 ? 'chg-pos' : 'chg-neg'}">${aff >= 0 ? '+' : ''}${aff}</span></div>
  `, () => handleClassmateAffinityMilestone(rel, def, justBonded, onDone))
}

function startRunning() {
  startScoredActivity({
    key: 'running',
    onReplay: () => {
      tryInvite('跑步', () => openRunningGame())
    },
    onQuickFinish: (bestScore) => {
      settleRunningResult(bestScore)
    },
  })
}

function settleRunningResult(dist, options = {}) {
  const { fromGame = false } = options
  const hgain = getRunningHealthGain(dist)
  rememberActivityBestScore('running', dist)
  if (player.monthStarted) applyChanges({ health: hgain })

  const showResult = () => {
    if (player.monthStarted) {
      showModal(`
        <div class="modal-title">跑步结束</div>
        <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0;">${dist}<span style="font-size:15px;font-weight:500;color:var(--text-muted)"> 米</span></div>
        <hr class="modal-divider">
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hgain}</span></div>
      `)
    }
  }

  if (!fromGame) {
    showResult()
    return
  }

  setTimeout(() => {
    closeGame()
    showResult()
  }, 1600)
}

function openRunningGame() {
  const overlay = document.getElementById('game-overlay')
  const canvas = document.getElementById('game-canvas')
  const info = document.getElementById('game-info')
  const ctx = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '跑步'
  overlay.classList.remove('hidden')
  info.textContent = '吃到补给，跑得更远'

  const SIZE = 300
  const GRID = 15
  const CELL = SIZE / GRID

  let snake = [{ x: 7, y: 7 }]
  let food = placeFood()
  let score = 0

  snakeNextDir = { x: 1, y: 0 }
  snakeCurDir = { x: 1, y: 0 }

  function placeFood() {
    let p
    do { p = { x: rndInt(GRID), y: rndInt(GRID) } }
    while (snake.some(s => s.x === p.x && s.y === p.y))
    return p
  }

  function draw() {
    ctx.fillStyle = '#4a7c42'
    ctx.fillRect(0, 0, SIZE, SIZE)

    ctx.save()
    ctx.strokeStyle = '#c8602a'
    ctx.lineWidth = 28
    ctx.beginPath()
    ctx.ellipse(SIZE / 2, SIZE / 2, SIZE * 0.38, SIZE * 0.33, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.strokeStyle = '#c8602a'
    ctx.lineWidth = 22
    ctx.beginPath()
    ctx.ellipse(SIZE / 2, SIZE / 2, SIZE * 0.21, SIZE * 0.16, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#f5e030'
    ctx.beginPath()
    ctx.arc((food.x + 0.5) * CELL, (food.y + 0.5) * CELL, CELL * 0.42, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,.25)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#1e3a8a' : '#3b64c8'
      ctx.beginPath()
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 5)
      ctx.fill()
    })

    ctx.fillStyle = 'rgba(255,255,255,.9)'
    ctx.font = 'bold 11px system-ui'
    ctx.fillText(`距离 ${score * 50} 米`, 5, 14)
  }

  function step() {
    snakeCurDir = { ...snakeNextDir }
    const head = { x: snake[0].x + snakeCurDir.x, y: snake[0].y + snakeCurDir.y }

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      endRunning()
      return
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
    const dist = score * 50
    info.textContent = `本次跑了 ${dist} 米`
    settleRunningResult(dist, { fromGame: true })
  }

  const onKey = (e) => {
    const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
    const d = map[e.key]
    if (d) { setSnakeDir(d[0], d[1]); e.preventDefault() }
  }
  document.addEventListener('keydown', onKey)

  let touchSt = null
  const onTouchStart = e => {
    touchSt = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = e => {
    if (!touchSt) return
    const dx = e.changedTouches[0].clientX - touchSt.x
    const dy = e.changedTouches[0].clientY - touchSt.y
    if (Math.abs(dx) > Math.abs(dy)) setSnakeDir(dx > 0 ? 1 : -1, 0)
    else setSnakeDir(0, dy > 0 ? 1 : -1)
    touchSt = null
  }
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  draw()
  restartTimer()

  snakeHandle = {
    stop: () => {
      clearInterval(timer)
      document.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
    },
  }
}
