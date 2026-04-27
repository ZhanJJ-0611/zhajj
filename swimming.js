/* ============================================================
   swimming.js — 游泳跑酷小游戏
   三条泳道，躲避对面游来的人，收集星星得分
   ============================================================ */

function startSwimming() {
  showGameTutorial('swimming', () => {
    if (player.monthStarted && !useEnergy()) return
    markActivityUsed('swimming')
    tryInvite('游泳', () => openSwimming())
  })
}

/* function startSwimming() {
  startScoredActivity({
    key: 'swimming',
    onReplay: () => {
      tryInvite('娓告吵', () => openSwimming())
    },
    onQuickFinish: (bestScore) => {
      settleSwimmingResult(bestScore)
    },
  })
}

function settleSwimmingResult(dist, options = {}) {
  const hg = Math.round(Math.min(dist, 2000) / 2000 * 8)
  const mg = Math.round(Math.min(dist, 2000) / 2000 * 8)
  const scoreText = options.starCount == null ? '一键通关直接按历史最高距离结算。' : `猸?鏀堕泦浜?${options.starCount} 棰楁槦鏄?`
  rememberActivityBestScore('swimming', dist)
  if (player.monthStarted) applyChanges({ mental: mg, health: hg })

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">馃強 娓告吵缁撴潫</div>
      <div style="font-size:32px;font-weight:800;text-align:center;margin:8px 0">${Math.floor(dist)}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 绫?/span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${scoreText}</div>
      <hr class="modal-divider">
      <div class="modal-row"><span>韬綋鍋ュ悍</span><span class="chg-pos">+${hg}</span></div>
      <div class="modal-row"><span>蹇冪悊鍋ュ悍</span><span class="chg-pos">+${mg}</span></div>
    `)
  }

  if (!options.fromGame) {
    showResult()
    return
  }

  setTimeout(() => {
    closeGame()
    showResult()
  }, 600)
}

}
*/

function startSwimming() {
  startScoredActivity({
    key: 'swimming',
    onReplay: () => {
      tryInvite('??', () => openSwimming())
    },
    onQuickFinish: (bestScore) => {
      settleSwimmingResult(bestScore)
    },
  })
}

function settleSwimmingResult(dist, options = {}) {
  const hg = Math.round(Math.min(dist, 2000) / 2000 * 8)
  const mg = Math.round(Math.min(dist, 2000) / 2000 * 8)
  const scoreText = options.starCount == null
    ? '本次直接按历史最高成绩结算。'
    : `本次共收集 ${options.starCount} 颗星星`
  rememberActivityBestScore('swimming', dist)
  if (player.monthStarted) applyChanges({ mental: mg, health: hg })

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">游泳结束</div>
      <div style="font-size:32px;font-weight:800;text-align:center;margin:8px 0">${Math.floor(dist)}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> ?</span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${scoreText}</div>
      <hr class="modal-divider">
      <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hg}</span></div>
      <div class="modal-row"><span>心理健康</span><span class="chg-pos">+${mg}</span></div>
    `)
  }

  if (!options.fromGame) {
    showResult()
    return
  }

  setTimeout(() => {
    closeGame()
    showResult()
  }, 600)
}

function openSwimming() {
  const overlay  = document.getElementById('game-overlay')
  const canvas   = document.getElementById('game-canvas')
  const infoEl   = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx      = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '??'
  controls.style.display = ''
  document.getElementById('dir-up').style.visibility   = 'hidden'
  document.getElementById('dir-down').style.visibility = 'hidden'
  overlay.classList.remove('hidden')
  infoEl.textContent = '左右切换泳道，躲人并收集星星'

  const W = 300, H = 300
  const LANES    = 3
  const LANE_W   = W / LANES    // 每条泳道 100px
  const PLAYER_Y = 248

  function laneCX(lane) { return lane * LANE_W + LANE_W / 2 }

  // ── 游戏状态 ──
  let playerLane = 1
  let playerX    = laneCX(1)
  let entities   = []          // { type:'star'|'obs', lane, y }
  let score      = 0
  let dist       = 0
  let speed      = 1.5
  let spawnCD    = 55
  let tileOff    = 0
  let frames     = 0
  let alive      = true
  let raf        = null
  let deathTimer = null

  // ── 更新逻辑 ──

  function update() {
    if (!alive) return

    frames++
    dist += speed * 0.09

    // 每 300 帧加速一次
    if (frames % 300 === 0 && speed < 4.1) speed += 0.3

    // 生成实体
    spawnCD--
    if (spawnCD <= 0) {
      const lane = Math.floor(Math.random() * LANES)
      const type = Math.random() < 0.42 ? 'obs' : 'star'
      // 避免顶部同泳道障碍叠加
      const topObs = entities.filter(e => e.type === 'obs' && e.y < 80)
      if (!(type === 'obs' && topObs.some(e => e.lane === lane))) {
        entities.push({ type, lane, y: -24 })
      }
      spawnCD = Math.floor(48 - speed * 4.5 + Math.random() * 18)
    }

    // 移动
    entities.forEach(e => { e.y += speed })
    entities = entities.filter(e => e.y < H + 30)

    // 平滑跟随目标泳道
    playerX += (laneCX(playerLane) - playerX) * 0.22

    // 背景滚动偏移
    tileOff = (tileOff + speed) % 40

    // 碰撞 & 收集（同泳道）
    entities = entities.filter(e => {
      if (e.lane !== playerLane) return true
      if (Math.abs(e.y - PLAYER_Y) < 26) {
        if (e.type === 'obs')  { alive = false; return false }
        if (e.type === 'star') { score++;        return false }
      }
      return true
    })
  }

  // ── 绘制工具 ──

  function drawStar5(cx, cy, r) {
    const inner = r * 0.42, pts = 5
    ctx.beginPath()
    for (let i = 0; i < pts * 2; i++) {
      const a   = (i * Math.PI / pts) - Math.PI / 2
      const rad = i % 2 === 0 ? r : inner
      const x   = cx + Math.cos(a) * rad
      const y   = cy + Math.sin(a) * rad
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath(); ctx.fill()
  }

  // ── 绘制泳池 ──

  function drawPool() {
    // 泳池底色
    ctx.fillStyle = '#1880ae'
    ctx.fillRect(0, 0, W, H)

    // 滚动横纹（营造向前感）
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 1
    for (let y = (tileOff % 40) - 40; y < H + 40; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // 每条泳道的 T 型底部标记（滚动）
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 3
    for (let lane = 0; lane < LANES; lane++) {
      const cx = laneCX(lane)
      for (let yo = (tileOff % 280) - 280; yo < H; yo += 280) {
        // 竖线
        ctx.beginPath(); ctx.moveTo(cx, yo); ctx.lineTo(cx, yo + 260); ctx.stroke()
        // T字横线
        ctx.beginPath(); ctx.moveTo(cx - 22, yo + 260); ctx.lineTo(cx + 22, yo + 260); ctx.stroke()
      }
    }

    // 泳道分隔绳（黄色虚线）
    ctx.setLineDash([6, 5])
    ctx.lineWidth = 2
    for (let i = 1; i < LANES; i++) {
      ctx.strokeStyle = 'rgba(255,200,40,0.65)'
      const x = i * LANE_W
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    ctx.setLineDash([])

    // 两侧池壁
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(0, 0, 5, H)
    ctx.fillRect(W - 5, 0, 5, H)

    // 当前泳道高亮（淡色）
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(playerLane * LANE_W, 0, LANE_W, H)
  }

  // ── 绘制实体 ──

  function drawEntities() {
    entities.forEach(e => {
      const ex = laneCX(e.lane)

      if (e.type === 'star') {
        const pulse = 1 + 0.1 * Math.sin(frames * 0.14 + e.lane * 2)
        ctx.save()
        ctx.translate(ex, e.y)
        ctx.scale(pulse, pulse)
        ctx.fillStyle = '#fcd34d'
        ctx.shadowColor = 'rgba(255,200,0,0.9)'; ctx.shadowBlur = 10
        drawStar5(0, 0, 10)
        ctx.shadowBlur = 0
        ctx.restore()

      } else {
        // 对面游来的人（红色泳帽）
        const arm = -Math.sin(frames * 0.18) * 17   // 逆向摆臂

        // 手臂（先画，在身体下方）
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(ex - 6, e.y + 4); ctx.lineTo(ex - 14, e.y + 4 + arm); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ex + 6, e.y + 4); ctx.lineTo(ex + 14, e.y + 4 - arm); ctx.stroke()
        ctx.lineCap = 'butt'

        // 身体
        ctx.fillStyle = '#dc2626'
        ctx.beginPath(); ctx.ellipse(ex, e.y + 8, 6, 10, 0, 0, Math.PI * 2); ctx.fill()

        // 泳帽（红色）
        ctx.fillStyle = '#ef4444'
        ctx.beginPath(); ctx.arc(ex, e.y - 3, 10, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5; ctx.stroke()

        // 护目镜
        ctx.fillStyle = '#1e293b'
        ctx.beginPath(); ctx.ellipse(ex - 3.5, e.y - 3, 3, 2, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(ex + 3.5, e.y - 3, 3, 2, 0, 0, Math.PI * 2); ctx.fill()
      }
    })
  }

  // ── 绘制玩家 ──

  function drawPlayer() {
    const x   = playerX, y = PLAYER_Y
    const arm = Math.sin(frames * 0.18) * 19

    // 手臂（在身体下层先画）
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 4; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x - 7, y + 2); ctx.lineTo(x - 15, y + 2 + arm); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x + 7, y + 2); ctx.lineTo(x + 15, y + 2 - arm); ctx.stroke()
    ctx.lineCap = 'butt'

    // 身体
    ctx.fillStyle = '#2563eb'
    ctx.beginPath(); ctx.ellipse(x, y + 6, 7, 11, 0, 0, Math.PI * 2); ctx.fill()

    // 泳帽（黄色）
    ctx.fillStyle = '#facc15'
    ctx.beginPath(); ctx.arc(x, y - 5, 11, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5; ctx.stroke()

    // 护目镜
    ctx.fillStyle = '#1e293b'
    ctx.beginPath(); ctx.ellipse(x - 4, y - 4, 3.5, 2.5, -0.2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(x + 4, y - 4, 3.5, 2.5,  0.2, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.ellipse(x - 4, y - 4, 3.5, 2.5, -0.2, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(x + 4, y - 4, 3.5, 2.5,  0.2, 0, Math.PI * 2); ctx.stroke()
  }

  // ── HUD ──

  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, W, 24)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`?? ${score}   ?? ${Math.floor(dist)} ?`, 10, 16)
    ctx.textAlign = 'right'
    ctx.fillText(`?? ${speed.toFixed(1)} ?`, W - 8, 16)
  }

  function drawDeathOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.58)'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 18px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('游泳结束', W / 2, H / 2 - 24)
    ctx.font = '13px system-ui'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(`?? ${Math.floor(dist)} ?`, W / 2, H / 2 + 4)
    ctx.fillText(`??? ${score} ???`, W / 2, H / 2 + 24)
  }

  // ── 主循环 ──

  function loop() {
    update()
    ctx.clearRect(0, 0, W, H)
    drawPool()
    drawEntities()
    drawPlayer()
    drawHUD()

    if (!alive) {
      drawDeathOverlay()
      if (!deathTimer) deathTimer = setTimeout(endSwimming, 1800)
    }

    raf = requestAnimationFrame(loop)
  }

  // ── 结束 ──

  function endSwimming() {
    cancelAnimationFrame(raf)
    raf = null
    settleSwimmingResult(dist, { fromGame: true, starCount: score })
  }

  // ── 输入 ──

  function goLeft()  { if (playerLane > 0)          playerLane-- }
  function goRight() { if (playerLane < LANES - 1)  playerLane++ }

  // 临时接管方向键按钮（左右→换泳道，上下无效）
  const origSetSnakeDir = window.setSnakeDir
  window.setSnakeDir = (dx, dy) => {
    if (dx === -1) goLeft()
    else if (dx === 1) goRight()
  }

  const onKey = e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') { goLeft();  e.preventDefault() }
    if (e.key === 'ArrowRight' || e.key === 'd') { goRight(); e.preventDefault() }
  }
  document.addEventListener('keydown', onKey)

  // 触屏：滑动或点击左/右半边切换泳道
  let tsX = null
  const onTouchStart = e => {
    tsX = e.touches[0].clientX
  }
  const onTouchEnd = e => {
    if (tsX === null) return
    const dx = e.changedTouches[0].clientX - tsX
    if (Math.abs(dx) > 18) {
      dx < 0 ? goLeft() : goRight()
    } else {
      const rx = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left
      rx < canvas.clientWidth / 2 ? goLeft() : goRight()
    }
    tsX = null
  }
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  // ── 清理句柄（复用 snakeHandle 变量） ──

  snakeHandle = {
    stop: () => {
      cancelAnimationFrame(raf); raf = null
      if (deathTimer) { clearTimeout(deathTimer); deathTimer = null }
      document.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
      window.setSnakeDir = origSetSnakeDir
      controls.style.display = ''
      document.getElementById('dir-up').style.visibility   = ''
      document.getElementById('dir-down').style.visibility = ''
    }
  }

  raf = requestAnimationFrame(loop)
}

function startSwimming() {
  startScoredActivity({
    key: 'swimming',
    onReplay: () => {
      tryInvite('游泳', () => openSwimming())
    },
    onQuickFinish: (bestScore) => {
      settleSwimmingResult(bestScore)
    },
  })
}

function settleSwimmingResult(dist, options = {}) {
  const hg = Math.round(Math.min(dist, 2000) / 2000 * 8)
  const mg = Math.round(Math.min(dist, 2000) / 2000 * 8)
  const scoreText = options.starCount == null
    ? '本次直接按历史最高成绩结算。'
    : `本次共收集 ${options.starCount} 颗星星`
  rememberActivityBestScore('swimming', dist)
  if (player.monthStarted) applyChanges({ mental: mg, health: hg })

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">游泳结束</div>
      <div style="font-size:32px;font-weight:800;text-align:center;margin:8px 0">${Math.floor(dist)}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 米</span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${scoreText}</div>
      <hr class="modal-divider">
      <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hg}</span></div>
      <div class="modal-row"><span>心理健康</span><span class="chg-pos">+${mg}</span></div>
    `)
  }

  if (!options.fromGame) {
    showResult()
    return
  }

  setTimeout(() => {
    closeGame()
    showResult()
  }, 600)
}

function openSwimming() {
  const overlay = document.getElementById('game-overlay')
  const canvas = document.getElementById('game-canvas')
  const infoEl = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '游泳'
  controls.style.display = ''
  document.getElementById('dir-up').style.visibility = 'hidden'
  document.getElementById('dir-down').style.visibility = 'hidden'
  overlay.classList.remove('hidden')
  infoEl.textContent = '左右切换泳道，躲人并收集星星'

  const W = 300
  const H = 300
  const LANES = 3
  const LANE_W = W / LANES
  const PLAYER_Y = 248

  function laneCX(lane) { return lane * LANE_W + LANE_W / 2 }

  let playerLane = 1
  let playerX = laneCX(1)
  let entities = []
  let score = 0
  let dist = 0
  let speed = 1.5
  let spawnCD = 55
  let tileOff = 0
  let frames = 0
  let alive = true
  let raf = null
  let deathTimer = null

  function update() {
    if (!alive) return

    frames++
    dist += speed * 0.09
    if (frames % 300 === 0 && speed < 4.1) speed += 0.3

    spawnCD--
    if (spawnCD <= 0) {
      const lane = Math.floor(Math.random() * LANES)
      const type = Math.random() < 0.42 ? 'obs' : 'star'
      const topObs = entities.filter(e => e.type === 'obs' && e.y < 80)
      if (!(type === 'obs' && topObs.some(e => e.lane === lane))) {
        entities.push({ type, lane, y: -24 })
      }
      spawnCD = Math.floor(48 - speed * 4.5 + Math.random() * 18)
    }

    entities.forEach(e => { e.y += speed })
    entities = entities.filter(e => e.y < H + 30)

    playerX += (laneCX(playerLane) - playerX) * 0.22
    tileOff = (tileOff + speed) % 40

    entities = entities.filter(e => {
      if (e.lane !== playerLane) return true
      if (Math.abs(e.y - PLAYER_Y) < 26) {
        if (e.type === 'obs') { alive = false; return false }
        if (e.type === 'star') { score++; return false }
      }
      return true
    })
  }

  function drawStar5(cx, cy, r) {
    const inner = r * 0.42
    const pts = 5
    ctx.beginPath()
    for (let i = 0; i < pts * 2; i++) {
      const a = (i * Math.PI / pts) - Math.PI / 2
      const rad = i % 2 === 0 ? r : inner
      const x = cx + Math.cos(a) * rad
      const y = cy + Math.sin(a) * rad
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
  }

  function drawPool() {
    ctx.fillStyle = '#1880ae'
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 1
    for (let y = (tileOff % 40) - 40; y < H + 40; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 3
    for (let lane = 0; lane < LANES; lane++) {
      const cx = laneCX(lane)
      for (let yo = (tileOff % 280) - 280; yo < H; yo += 280) {
        ctx.beginPath()
        ctx.moveTo(cx, yo)
        ctx.lineTo(cx, yo + 260)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cx - 22, yo + 260)
        ctx.lineTo(cx + 22, yo + 260)
        ctx.stroke()
      }
    }

    ctx.setLineDash([6, 5])
    ctx.lineWidth = 2
    for (let i = 1; i < LANES; i++) {
      ctx.strokeStyle = 'rgba(255,200,40,0.65)'
      const x = i * LANE_W
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(0, 0, 5, H)
    ctx.fillRect(W - 5, 0, 5, H)

    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(playerLane * LANE_W, 0, LANE_W, H)
  }

  function drawEntities() {
    entities.forEach(e => {
      const ex = laneCX(e.lane)

      if (e.type === 'star') {
        const pulse = 1 + 0.1 * Math.sin(frames * 0.14 + e.lane * 2)
        ctx.save()
        ctx.translate(ex, e.y)
        ctx.scale(pulse, pulse)
        ctx.fillStyle = '#fcd34d'
        ctx.shadowColor = 'rgba(255,200,0,0.9)'
        ctx.shadowBlur = 10
        drawStar5(0, 0, 10)
        ctx.shadowBlur = 0
        ctx.restore()
      } else {
        const arm = -Math.sin(frames * 0.18) * 17

        ctx.strokeStyle = '#f87171'
        ctx.lineWidth = 3.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(ex - 6, e.y + 4)
        ctx.lineTo(ex - 14, e.y + 4 + arm)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ex + 6, e.y + 4)
        ctx.lineTo(ex + 14, e.y + 4 - arm)
        ctx.stroke()
        ctx.lineCap = 'butt'

        ctx.fillStyle = '#dc2626'
        ctx.beginPath()
        ctx.ellipse(ex, e.y + 8, 6, 10, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(ex, e.y - 3, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = '#1e293b'
        ctx.beginPath()
        ctx.ellipse(ex - 3.5, e.y - 3, 3, 2, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(ex + 3.5, e.y - 3, 3, 2, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  function drawPlayer() {
    const x = playerX
    const y = PLAYER_Y
    const arm = Math.sin(frames * 0.18) * 19

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x - 7, y + 2)
    ctx.lineTo(x - 15, y + 2 + arm)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 7, y + 2)
    ctx.lineTo(x + 15, y + 2 - arm)
    ctx.stroke()
    ctx.lineCap = 'butt'

    ctx.fillStyle = '#2563eb'
    ctx.beginPath()
    ctx.ellipse(x, y + 6, 7, 11, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#facc15'
    ctx.beginPath()
    ctx.arc(x, y - 5, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = '#1e293b'
    ctx.beginPath()
    ctx.ellipse(x - 4, y - 4, 3.5, 2.5, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + 4, y - 4, 3.5, 2.5, 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(x - 4, y - 4, 3.5, 2.5, -0.2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(x + 4, y - 4, 3.5, 2.5, 0.2, 0, Math.PI * 2)
    ctx.stroke()
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, W, 24)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`星星 ${score}   距离 ${Math.floor(dist)} 米`, 10, 16)
    ctx.textAlign = 'right'
    ctx.fillText(`速度 ${speed.toFixed(1)}`, W - 8, 16)
  }

  function drawDeathOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.58)'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 18px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('游泳结束', W / 2, H / 2 - 24)
    ctx.font = '13px system-ui'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(`距离 ${Math.floor(dist)} 米`, W / 2, H / 2 + 4)
    ctx.fillText(`收集了 ${score} 颗星星`, W / 2, H / 2 + 24)
  }

  function loop() {
    update()
    ctx.clearRect(0, 0, W, H)
    drawPool()
    drawEntities()
    drawPlayer()
    drawHUD()

    if (!alive) {
      drawDeathOverlay()
      if (!deathTimer) deathTimer = setTimeout(endSwimming, 1800)
    }

    raf = requestAnimationFrame(loop)
  }

  function endSwimming() {
    cancelAnimationFrame(raf)
    raf = null
    settleSwimmingResult(dist, { fromGame: true, starCount: score })
  }

  function goLeft() { if (playerLane > 0) playerLane-- }
  function goRight() { if (playerLane < LANES - 1) playerLane++ }

  const origSetSnakeDir = window.setSnakeDir
  window.setSnakeDir = (dx, dy) => {
    if (dx === -1) goLeft()
    else if (dx === 1) goRight()
  }

  const onKey = e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') { goLeft(); e.preventDefault() }
    if (e.key === 'ArrowRight' || e.key === 'd') { goRight(); e.preventDefault() }
  }
  document.addEventListener('keydown', onKey)

  let tsX = null
  const onTouchStart = e => {
    tsX = e.touches[0].clientX
  }
  const onTouchEnd = e => {
    if (tsX === null) return
    const dx = e.changedTouches[0].clientX - tsX
    if (Math.abs(dx) > 18) {
      dx < 0 ? goLeft() : goRight()
    } else {
      const rx = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left
      rx < canvas.clientWidth / 2 ? goLeft() : goRight()
    }
    tsX = null
  }
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  snakeHandle = {
    stop: () => {
      cancelAnimationFrame(raf)
      raf = null
      if (deathTimer) { clearTimeout(deathTimer); deathTimer = null }
      document.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
      window.setSnakeDir = origSetSnakeDir
      controls.style.display = ''
      document.getElementById('dir-up').style.visibility = ''
      document.getElementById('dir-down').style.visibility = ''
    },
  }

  raf = requestAnimationFrame(loop)
}
