/* ============================================================
   skyfight.js — 飞机空战弹幕游戏
   击落敌机得分，躲避弹幕，速度越来越快
   不增加身体健康，心理健康加成更高
   ============================================================ */

function startSkyFight() {
  showGameTutorial('skyfight', () => {
    if (player.monthStarted && !useEnergy()) return
    markActivityUsed('skyfight')
    openSkyFight()
  })
}

/* function startSkyFight() {
  startScoredActivity({
    key: 'skyfight',
    onReplay: () => {
      openSkyFight()
    },
    onQuickFinish: (bestScore) => {
      settleSkyFightResult(bestScore)
    },
  })
}

function settleSkyFightResult(score, options = {}) {
  const mg = Math.round(Math.min(score, 4000) / 4000 * 15)
  rememberActivityBestScore('skyfight', score)
  if (player.monthStarted) applyChanges({ mental: mg })

  const detailText = options.level == null
    ? '一键通关直接按历史最高得分结算。'
    : `鏈€楂樼瓑绾?Lv.${options.level}`

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">馃幃 鐢靛瓙娓告垙缁撴潫</div>
      <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${score}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 鍒?/span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${detailText}</div>
      <hr class="modal-divider">
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

function startSkyFight() {
  startScoredActivity({
    key: 'skyfight',
    onReplay: () => {
      openSkyFight()
    },
    onQuickFinish: (bestScore) => {
      settleSkyFightResult(bestScore)
    },
  })
}

function settleSkyFightResult(score, options = {}) {
  const mg = Math.round(Math.min(score, 4000) / 4000 * 15)
  rememberActivityBestScore('skyfight', score)
  if (player.monthStarted) applyChanges({ mental: mg })

  const detailText = options.level == null
    ? '本次直接按历史最高得分结算。'
    : `本次最高达到 Lv.${options.level}`

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">电子游戏结束</div>
      <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${score}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> ?</span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${detailText}</div>
      <hr class="modal-divider">
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

function openSkyFight() {
  const overlay  = document.getElementById('game-overlay')
  const canvas   = document.getElementById('game-canvas')
  const infoEl   = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx      = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '电子游戏'
  controls.style.display = ''   // 全部方向键可用
  overlay.classList.remove('hidden')
  infoEl.textContent = '移动战机，躲避弹幕并击落敌机'

  const W = 300, H = 300

  // ── 玩家参数 ──
  const PW = 18, PH = 22, PHIT = 5, PSPEED = 3.8
  let px = W / 2, py = H - 42
  let pHp = 3, pShootCD = 0, invincible = 0, pAlive = true

  // ── 游戏状态 ──
  let enemies       = []
  let pBullets      = []   // 玩家子弹
  let eBullets      = []   // 敌方弹幕
  let particles     = []   // 爆炸粒子
  let stars         = []   // 背景星星
  let score         = 0
  let frames        = 0
  let level         = 1
  let spawnCD       = 80
  let bossCD        = 0    // 精英敌机计时
  let state         = 'playing'  // 'playing' | 'dead'
  let raf           = null
  let endTimer      = null

  // 方向键状态
  const keys = { up: false, down: false, left: false, right: false }
  // 触屏目标位置
  let touchTarget = null

  // ── 背景星星 ──
  for (let i = 0; i < 45; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      spd: Math.random() * 0.5 + 0.25,
    })
  }

  // ── 工具函数 ──

  function spd() { return Math.hypot(...arguments) }  // unused, clarity helper

  function addParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const s = 1.2 + Math.random() * 2.2
      particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        r: 2 + Math.random() * 2, life: 22 + Math.random() * 12 | 0,
        maxLife: 34, color,
      })
    }
  }

  // ── 生成敌机 ──

  function spawnNormal() {
    const x = 18 + Math.random() * (W - 36)
    enemies.push({
      x, y: -22, type: 1, hp: 1, maxHp: 1,
      vx: (Math.random() - 0.5) * 1.05,
      vy: 0.525 + level * 0.105,
      shootCD: 20 + Math.floor(Math.random() * 40),
      shootInterval: Math.max(28, 72 - level * 6),
      alive: true, age: 0,
    })
  }

  function spawnElite() {
    const x = 30 + Math.random() * (W - 60)
    enemies.push({
      x, y: -28, type: 2, hp: 3, maxHp: 3,
      vx: (Math.random() - 0.5) * 0.75,
      vy: 0.375 + level * 0.075,
      shootCD: 30,
      shootInterval: Math.max(35, 80 - level * 5),
      alive: true, age: 0,
    })
  }

  // ── 敌机开火逻辑 ──

  function enemyFire(e) {
    const dx = px - e.x, dy = py - e.y
    const len = Math.hypot(dx, dy) || 1
    const bs  = 1.35 + level * 0.15 + (e.type === 2 ? 0.3 : 0)

    if (e.type === 1) {
      // 单发瞄准
      eBullets.push({ x: e.x, y: e.y + 10, vx: dx / len * bs, vy: dy / len * bs, r: 4, alive: true })

    } else {
      // 三向 + 高等级追加全向
      for (let i = -1; i <= 1; i++) {
        const a = Math.atan2(dy, dx) + i * 0.4
        eBullets.push({ x: e.x, y: e.y + 12, vx: Math.cos(a) * bs, vy: Math.sin(a) * bs, r: 4.5, alive: true })
      }
      if (level >= 4) {
        const ring = level >= 6 ? 12 : 8
        for (let i = 0; i < ring; i++) {
          const a = (i / ring) * Math.PI * 2
          eBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.6, r: 3.5, alive: true })
        }
      }
    }
  }

  // ── 更新 ──

  function update() {
    if (state !== 'playing') return
    frames++

    // 等级：每 15 秒升一级
    level = 1 + (frames / 900 | 0)

    // 生成普通敌机
    spawnCD--
    if (spawnCD <= 0) {
      spawnNormal()
      spawnCD = Math.max(38, 80 - level * 8) + (Math.random() * 20 | 0)
    }

    // 每 20 秒生成精英（level 2+ 开始）
    if (level >= 2) {
      bossCD++
      if (bossCD >= 1200 - level * 50) { spawnElite(); bossCD = 0 }
    }

    // 玩家移动（方向键）
    let mvx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
    let mvy = (keys.down  ? 1 : 0) - (keys.up   ? 1 : 0)
    if (mvx && mvy) { mvx *= 0.707; mvy *= 0.707 }

    // 触屏跟随
    if (touchTarget) {
      const tdx = touchTarget.x - px, tdy = touchTarget.y - py
      const d = Math.hypot(tdx, tdy)
      if (d > 4) {
        const s = Math.min(d, PSPEED * 1.3)
        mvx = tdx / d * s; mvy = tdy / d * s
      }
    }

    px = Math.max(PW / 2, Math.min(W - PW / 2, px + mvx * PSPEED))
    py = Math.max(PH / 2, Math.min(H - PH / 2, py + mvy * PSPEED))

    // 自动射击
    pShootCD--
    if (pShootCD <= 0) {
      const bspd = 7.5
      pBullets.push({ x: px, y: py - PH / 2, vy: -bspd, alive: true })
      if (level >= 3) {
        pBullets.push({ x: px - 8, y: py - PH / 2 + 6, vy: -bspd, alive: true })
        pBullets.push({ x: px + 8, y: py - PH / 2 + 6, vy: -bspd, alive: true })
      }
      pShootCD = Math.max(7, 16 - level)
    }

    // 移动玩家子弹
    pBullets.forEach(b => { b.y += b.vy; if (b.y < -12) b.alive = false })
    pBullets = pBullets.filter(b => b.alive)

    // 移动敌方弹幕
    eBullets.forEach(b => {
      b.x += b.vx; b.y += b.vy
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) b.alive = false
    })
    eBullets = eBullets.filter(b => b.alive)

    // 更新敌机
    enemies.forEach(e => {
      e.age++; e.x += e.vx; e.y += e.vy
      if (e.x < 14 || e.x > W - 14) e.vx *= -1
      if (e.y > H + 35) e.alive = false
      // 开火
      e.shootCD--
      if (e.shootCD <= 0) { enemyFire(e); e.shootCD = e.shootInterval }
    })

    // 玩家子弹 vs 敌机
    pBullets.forEach(b => {
      enemies.forEach(e => {
        if (!b.alive || !e.alive) return
        if (Math.hypot(b.x - e.x, b.y - e.y) < 13 + e.type * 3) {
          b.alive = false
          e.hp--
          if (e.hp <= 0) {
            e.alive = false
            score += e.type === 2 ? 300 : 100
            addParticles(e.x, e.y, e.type === 2 ? '#fb923c' : '#f87171', e.type === 2 ? 12 : 8)
          }
        }
      })
    })

    // 敌方弹幕 vs 玩家
    if (invincible <= 0 && pAlive) {
      for (const b of eBullets) {
        if (!b.alive) continue
        if (Math.hypot(b.x - px, b.y - py) < PHIT + b.r - 1) {
          b.alive = false; pHp--; invincible = 95
          addParticles(px, py, '#93c5fd', 6)
          if (pHp <= 0) {
            pAlive = false; state = 'dead'
            addParticles(px, py, '#ffffff', 10)
            addParticles(px - 8,  py + 6, '#ef4444', 8)
            addParticles(px + 8,  py - 4, '#f97316', 8)
            if (!endTimer) endTimer = setTimeout(endSkyFight, 2000)
          }
          break
        }
      }
    }

    // 敌机撞玩家
    if (invincible <= 0 && pAlive) {
      for (const e of enemies) {
        if (!e.alive) continue
        if (Math.hypot(e.x - px, e.y - py) < PHIT + 12) {
          e.alive = false; pHp--; invincible = 95
          addParticles(e.x, e.y, '#ef4444', 8)
          if (pHp <= 0) {
            pAlive = false; state = 'dead'
            if (!endTimer) endTimer = setTimeout(endSkyFight, 2000)
          }
          break
        }
      }
    }

    if (invincible > 0) invincible--

    // 每秒得分
    if (frames % 60 === 0) score += level

    // 清理
    enemies   = enemies.filter(e => e.alive)
    pBullets  = pBullets.filter(b => b.alive)
    eBullets  = eBullets.filter(b => b.alive)

    // 粒子
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life--
      p.vx *= 0.88; p.vy *= 0.88
    })
    particles = particles.filter(p => p.life > 0)

    // 星星滚动
    stars.forEach(s => {
      s.y += s.spd + level * 0.08
      if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W }
    })
  }

  // ── 绘制 ──

  function drawBG() {
    ctx.fillStyle = '#06101f'
    ctx.fillRect(0, 0, W, H)
    stars.forEach(s => {
      ctx.globalAlpha = 0.35 + s.r * 0.25
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  function drawPlayerPlane() {
    if (!pAlive) return
    if (invincible > 0 && (invincible / 6 | 0) % 2 === 0) return  // 无敌闪烁
    ctx.save()
    ctx.translate(px, py)

    // 引擎尾焰
    const flicker = 4 + Math.sin(frames * 0.35) * 2
    const flameGrad = ctx.createLinearGradient(0, PH * 0.3, 0, PH * 0.3 + flicker + 8)
    flameGrad.addColorStop(0, 'rgba(120,200,255,0.9)')
    flameGrad.addColorStop(1, 'rgba(0,120,255,0)')
    ctx.fillStyle = flameGrad
    ctx.beginPath()
    ctx.ellipse(0, PH * 0.3 + flicker / 2, 4, flicker, 0, 0, Math.PI * 2)
    ctx.fill()

    // 机翼阴影
    ctx.fillStyle = 'rgba(0,60,140,0.5)'
    ctx.beginPath()
    ctx.moveTo(-PW * 0.55, PH * 0.4)
    ctx.lineTo(PW * 0.55, PH * 0.4)
    ctx.lineTo(0, -PH * 0.5)
    ctx.closePath()
    ctx.fill()

    // 机体主体（蓝色战机）
    ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 10
    ctx.fillStyle = '#2563eb'
    ctx.beginPath()
    ctx.moveTo(0, -PH / 2)           // 机头
    ctx.lineTo(-PW / 2, PH * 0.35)  // 左翼尖
    ctx.lineTo(-PW * 0.22, PH * 0.1)
    ctx.lineTo(-PW * 0.12, PH / 2)  // 左尾
    ctx.lineTo(0, PH * 0.3)
    ctx.lineTo(PW * 0.12, PH / 2)   // 右尾
    ctx.lineTo(PW * 0.22, PH * 0.1)
    ctx.lineTo(PW / 2, PH * 0.35)   // 右翼尖
    ctx.closePath(); ctx.fill()
    ctx.shadowBlur = 0

    // 高光
    ctx.fillStyle = '#93c5fd'
    ctx.beginPath(); ctx.ellipse(0, -PH * 0.2, 3, 6, 0, 0, Math.PI * 2); ctx.fill()

    ctx.restore()
  }

  function drawPBullets() {
    ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 6
    ctx.fillStyle = '#7dd3fc'
    pBullets.forEach(b => {
      ctx.fillRect(b.x - 1.5, b.y - 7, 3, 10)
    })
    ctx.shadowBlur = 0
  }

  function drawEnemies() {
    enemies.forEach(e => {
      if (!e.alive) return
      ctx.save()
      ctx.translate(e.x, e.y)
      ctx.rotate(Math.PI)   // 机头朝下

      const isElite = e.type === 2
      const ew = isElite ? 22 : 16, eh = isElite ? 22 : 16
      const mc = isElite ? '#c2410c' : '#dc2626'
      const hc = isElite ? '#fed7aa' : '#fca5a5'

      ctx.shadowColor = mc; ctx.shadowBlur = isElite ? 10 : 6
      ctx.fillStyle = mc
      ctx.beginPath()
      ctx.moveTo(0, -eh / 2)
      ctx.lineTo(-ew / 2, eh * 0.35)
      ctx.lineTo(-ew * 0.2, eh * 0.1)
      ctx.lineTo(-ew * 0.1, eh / 2)
      ctx.lineTo(0, eh * 0.3)
      ctx.lineTo(ew * 0.1, eh / 2)
      ctx.lineTo(ew * 0.2, eh * 0.1)
      ctx.lineTo(ew / 2, eh * 0.35)
      ctx.closePath(); ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = hc
      ctx.beginPath(); ctx.ellipse(0, -eh * 0.18, 2.5, 4, 0, 0, Math.PI * 2); ctx.fill()

      // 精英机尾焰（橙色）
      if (isElite) {
        const fl = 3 + Math.sin(frames * 0.25 + e.x) * 1.5
        ctx.fillStyle = 'rgba(251,146,60,0.7)'
        ctx.beginPath(); ctx.ellipse(0, eh * 0.35, 3.5, fl, 0, 0, Math.PI * 2); ctx.fill()
      }

      ctx.restore()

      // 精英机血条
      if (isElite) {
        const bw = 24, bh = 3
        const filled = (e.hp / e.maxHp) * bw
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(e.x - bw / 2, e.y + 14, bw, bh)
        ctx.fillStyle = e.hp > 1 ? '#4ade80' : '#facc15'
        ctx.fillRect(e.x - bw / 2, e.y + 14, filled, bh)
      }
    })
  }

  function drawEBullets() {
    eBullets.forEach(b => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
      g.addColorStop(0,   'rgba(255,255,255,1)')
      g.addColorStop(0.35,'rgba(255,80,80,1)')
      g.addColorStop(1,   'rgba(220,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
    })
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.42)'
    ctx.fillRect(0, 0, W, 22)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`?? ${pHp}/3`, 8, 15)
    ctx.textAlign = 'right'
    ctx.fillText(`?? ${score}   Lv.${level}`, W - 8, 15)
  }

  function drawDeadOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f87171'
    ctx.font = 'bold 21px system-ui'
    ctx.fillText('战机被击落了', W / 2, H / 2 - 22)
    ctx.fillStyle = 'rgba(255,255,255,0.78)'
    ctx.font = '13px system-ui'
    ctx.fillText(`???${score}`, W / 2, H / 2 + 6)
    ctx.fillText(`最高等级 Lv.${level}`, W / 2, H / 2 + 26)
  }

  // ── 主循环 ──

  function loop() {
    update()
    ctx.clearRect(0, 0, W, H)
    drawBG()
    drawParticles()
    drawPBullets()
    drawEBullets()
    drawEnemies()
    drawPlayerPlane()
    drawHUD()
    if (state === 'dead') drawDeadOverlay()
    raf = requestAnimationFrame(loop)
  }

  // ── 结束 ──

  function endSkyFight() {
    cancelAnimationFrame(raf)
    raf = null
    if (window._esportsTestCallback) {
      const cb = window._esportsTestCallback
      window._esportsTestCallback = null
      setTimeout(() => { closeGame(); cb(score) }, 600)
      return
    }
    settleSkyFightResult(score, { fromGame: true, level })
  }

  // ── 输入 ──

  // 方向键按钮接管（上下左右均支持）
  const origSetSnakeDir = window.setSnakeDir
  window.setSnakeDir = (dx, dy) => {
    if (dx === -1) { keys.left  = true;  keys.right = false }
    else if (dx === 1)  { keys.right = true;  keys.left  = false }
    else if (dy === -1) { keys.up    = true;  keys.down  = false }
    else if (dy ===  1) { keys.down  = true;  keys.up    = false }
  }
  const onPUp = () => { keys.left = false; keys.right = false; keys.up = false; keys.down = false }
  document.addEventListener('pointerup', onPUp)

  // 键盘
  const DIR = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down',
                a:'left', d:'right', w:'up', s:'down' }
  const onKey   = e => { if (DIR[e.key]) { keys[DIR[e.key]] = true;  e.preventDefault() } }
  const onKeyUp = e => { if (DIR[e.key])   keys[DIR[e.key]] = false }
  document.addEventListener('keydown', onKey)
  document.addEventListener('keyup',   onKeyUp)

  // 触屏拖动（玩家跟随手指）
  const getCanvasPos = (cx, cy) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (cx - rect.left) / rect.width  * W,
      y: (cy - rect.top)  / rect.height * H,
    }
  }
  const onTouchStart = e => { touchTarget = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY) }
  const onTouchMove  = e => {
    touchTarget = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY)
    e.preventDefault()
  }
  const onTouchEnd   = () => { touchTarget = null }
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
  canvas.addEventListener('touchend',   onTouchEnd,   { passive: true })

  // ── 清理句柄 ──

  snakeHandle = {
    stop: () => {
      cancelAnimationFrame(raf); raf = null
      if (endTimer) { clearTimeout(endTimer); endTimer = null }
      document.removeEventListener('keydown',   onKey)
      document.removeEventListener('keyup',     onKeyUp)
      document.removeEventListener('pointerup', onPUp)
      canvas.removeEventListener('touchstart',  onTouchStart)
      canvas.removeEventListener('touchmove',   onTouchMove)
      canvas.removeEventListener('touchend',    onTouchEnd)
      window.setSnakeDir = origSetSnakeDir
      controls.style.display = ''
      // Early exit during esports test — treat as failure (score 0)
      if (window._esportsTestCallback) {
        const cb = window._esportsTestCallback
        window._esportsTestCallback = null
        setTimeout(() => cb(0), 100)
      }
    }
  }

  raf = requestAnimationFrame(loop)
}

function startSkyFight() {
  startScoredActivity({
    key: 'skyfight',
    onReplay: () => {
      openSkyFight()
    },
    onQuickFinish: (bestScore) => {
      settleSkyFightResult(bestScore)
    },
  })
}

function settleSkyFightResult(score, options = {}) {
  const mg = Math.round(Math.min(score, 4000) / 4000 * 15)
  rememberActivityBestScore('skyfight', score)
  if (player.monthStarted) applyChanges({ mental: mg })

  const detailText = options.level == null
    ? '本次直接按历史最高得分结算。'
    : `本次最高达到 Lv.${options.level}`

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">电子游戏结束</div>
      <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${score}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 分</span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${detailText}</div>
      <hr class="modal-divider">
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

function openSkyFight() {
  const overlay = document.getElementById('game-overlay')
  const canvas = document.getElementById('game-canvas')
  const infoEl = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '电子游戏'
  controls.style.display = ''
  overlay.classList.remove('hidden')
  infoEl.textContent = '移动战机，躲避弹幕并击落敌机'

  const W = 300
  const H = 300
  const PW = 18
  const PH = 22
  const PHIT = 5
  const PSPEED = 3.8
  let px = W / 2
  let py = H - 42
  let pHp = 3
  let pShootCD = 0
  let invincible = 0
  let pAlive = true

  let enemies = []
  let pBullets = []
  let eBullets = []
  let particles = []
  let stars = []
  let score = 0
  let frames = 0
  let level = 1
  let spawnCD = 80
  let bossCD = 0
  let state = 'playing'
  let raf = null
  let endTimer = null

  const keys = { up: false, down: false, left: false, right: false }
  let touchTarget = null

  for (let i = 0; i < 45; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      spd: Math.random() * 0.5 + 0.25,
    })
  }

  function addParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const s = 1.2 + Math.random() * 2.2
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        r: 2 + Math.random() * 2,
        life: 22 + Math.random() * 12 | 0,
        maxLife: 34,
        color,
      })
    }
  }

  function spawnNormal() {
    const x = 18 + Math.random() * (W - 36)
    enemies.push({
      x,
      y: -22,
      type: 1,
      hp: 1,
      maxHp: 1,
      vx: (Math.random() - 0.5) * 1.05,
      vy: 0.525 + level * 0.105,
      shootCD: 20 + Math.floor(Math.random() * 40),
      shootInterval: Math.max(28, 72 - level * 6),
      alive: true,
      age: 0,
    })
  }

  function spawnElite() {
    const x = 30 + Math.random() * (W - 60)
    enemies.push({
      x,
      y: -28,
      type: 2,
      hp: 3,
      maxHp: 3,
      vx: (Math.random() - 0.5) * 0.75,
      vy: 0.375 + level * 0.075,
      shootCD: 30,
      shootInterval: Math.max(35, 80 - level * 5),
      alive: true,
      age: 0,
    })
  }

  function enemyFire(e) {
    const dx = px - e.x
    const dy = py - e.y
    const len = Math.hypot(dx, dy) || 1
    const bs = 1.35 + level * 0.15 + (e.type === 2 ? 0.3 : 0)

    if (e.type === 1) {
      eBullets.push({ x: e.x, y: e.y + 10, vx: dx / len * bs, vy: dy / len * bs, r: 4, alive: true })
    } else {
      for (let i = -1; i <= 1; i++) {
        const a = Math.atan2(dy, dx) + i * 0.4
        eBullets.push({ x: e.x, y: e.y + 12, vx: Math.cos(a) * bs, vy: Math.sin(a) * bs, r: 4.5, alive: true })
      }
      if (level >= 4) {
        const ring = level >= 6 ? 12 : 8
        for (let i = 0; i < ring; i++) {
          const a = (i / ring) * Math.PI * 2
          eBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.6, r: 3.5, alive: true })
        }
      }
    }
  }

  function update() {
    if (state !== 'playing') return
    frames++
    level = 1 + (frames / 900 | 0)

    spawnCD--
    if (spawnCD <= 0) {
      spawnNormal()
      spawnCD = Math.max(38, 80 - level * 8) + (Math.random() * 20 | 0)
    }

    if (level >= 2) {
      bossCD++
      if (bossCD >= 1200 - level * 50) { spawnElite(); bossCD = 0 }
    }

    let mvx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
    let mvy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
    if (mvx && mvy) { mvx *= 0.707; mvy *= 0.707 }

    if (touchTarget) {
      const tdx = touchTarget.x - px
      const tdy = touchTarget.y - py
      const d = Math.hypot(tdx, tdy)
      if (d > 4) {
        const s = Math.min(d, PSPEED * 1.3)
        mvx = tdx / d * s
        mvy = tdy / d * s
      }
    }

    px = Math.max(PW / 2, Math.min(W - PW / 2, px + mvx * PSPEED))
    py = Math.max(PH / 2, Math.min(H - PH / 2, py + mvy * PSPEED))

    pShootCD--
    if (pShootCD <= 0) {
      const bspd = 7.5
      pBullets.push({ x: px, y: py - PH / 2, vy: -bspd, alive: true })
      if (level >= 3) {
        pBullets.push({ x: px - 8, y: py - PH / 2 + 6, vy: -bspd, alive: true })
        pBullets.push({ x: px + 8, y: py - PH / 2 + 6, vy: -bspd, alive: true })
      }
      pShootCD = Math.max(7, 16 - level)
    }

    pBullets.forEach(b => { b.y += b.vy; if (b.y < -12) b.alive = false })
    pBullets = pBullets.filter(b => b.alive)

    eBullets.forEach(b => {
      b.x += b.vx
      b.y += b.vy
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) b.alive = false
    })
    eBullets = eBullets.filter(b => b.alive)

    enemies.forEach(e => {
      e.age++
      e.x += e.vx
      e.y += e.vy
      if (e.x < 14 || e.x > W - 14) e.vx *= -1
      if (e.y > H + 35) e.alive = false
      e.shootCD--
      if (e.shootCD <= 0) { enemyFire(e); e.shootCD = e.shootInterval }
    })

    pBullets.forEach(b => {
      enemies.forEach(e => {
        if (!b.alive || !e.alive) return
        if (Math.hypot(b.x - e.x, b.y - e.y) < 13 + e.type * 3) {
          b.alive = false
          e.hp--
          if (e.hp <= 0) {
            e.alive = false
            score += e.type === 2 ? 300 : 100
            addParticles(e.x, e.y, e.type === 2 ? '#fb923c' : '#f87171', e.type === 2 ? 12 : 8)
          }
        }
      })
    })

    if (invincible <= 0 && pAlive) {
      for (const b of eBullets) {
        if (!b.alive) continue
        if (Math.hypot(b.x - px, b.y - py) < PHIT + b.r - 1) {
          b.alive = false
          pHp--
          invincible = 95
          addParticles(px, py, '#93c5fd', 6)
          if (pHp <= 0) {
            pAlive = false
            state = 'dead'
            addParticles(px, py, '#ffffff', 10)
            addParticles(px - 8, py + 6, '#ef4444', 8)
            addParticles(px + 8, py - 4, '#f97316', 8)
            if (!endTimer) endTimer = setTimeout(endSkyFight, 2000)
          }
          break
        }
      }
    }

    if (invincible <= 0 && pAlive) {
      for (const e of enemies) {
        if (!e.alive) continue
        if (Math.hypot(e.x - px, e.y - py) < PHIT + 12) {
          e.alive = false
          pHp--
          invincible = 95
          addParticles(e.x, e.y, '#ef4444', 8)
          if (pHp <= 0) {
            pAlive = false
            state = 'dead'
            if (!endTimer) endTimer = setTimeout(endSkyFight, 2000)
          }
          break
        }
      }
    }

    if (invincible > 0) invincible--
    if (frames % 60 === 0) score += level

    enemies = enemies.filter(e => e.alive)
    pBullets = pBullets.filter(b => b.alive)
    eBullets = eBullets.filter(b => b.alive)

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.life--
      p.vx *= 0.88
      p.vy *= 0.88
    })
    particles = particles.filter(p => p.life > 0)

    stars.forEach(s => {
      s.y += s.spd + level * 0.08
      if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W }
    })
  }

  function drawBG() {
    ctx.fillStyle = '#06101f'
    ctx.fillRect(0, 0, W, H)
    stars.forEach(s => {
      ctx.globalAlpha = 0.35 + s.r * 0.25
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  function drawPlayerPlane() {
    if (!pAlive) return
    if (invincible > 0 && (invincible / 6 | 0) % 2 === 0) return
    ctx.save()
    ctx.translate(px, py)

    const flicker = 4 + Math.sin(frames * 0.35) * 2
    const flameGrad = ctx.createLinearGradient(0, PH * 0.3, 0, PH * 0.3 + flicker + 8)
    flameGrad.addColorStop(0, 'rgba(120,200,255,0.9)')
    flameGrad.addColorStop(1, 'rgba(0,120,255,0)')
    ctx.fillStyle = flameGrad
    ctx.beginPath()
    ctx.ellipse(0, PH * 0.3 + flicker / 2, 4, flicker, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(0,60,140,0.5)'
    ctx.beginPath()
    ctx.moveTo(-PW * 0.55, PH * 0.4)
    ctx.lineTo(PW * 0.55, PH * 0.4)
    ctx.lineTo(0, -PH * 0.5)
    ctx.closePath()
    ctx.fill()

    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#2563eb'
    ctx.beginPath()
    ctx.moveTo(0, -PH / 2)
    ctx.lineTo(-PW / 2, PH * 0.35)
    ctx.lineTo(-PW * 0.22, PH * 0.1)
    ctx.lineTo(-PW * 0.12, PH / 2)
    ctx.lineTo(0, PH * 0.3)
    ctx.lineTo(PW * 0.12, PH / 2)
    ctx.lineTo(PW * 0.22, PH * 0.1)
    ctx.lineTo(PW / 2, PH * 0.35)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#93c5fd'
    ctx.beginPath()
    ctx.ellipse(0, -PH * 0.2, 3, 6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  function drawPBullets() {
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#7dd3fc'
    pBullets.forEach(b => {
      ctx.fillRect(b.x - 1.5, b.y - 7, 3, 10)
    })
    ctx.shadowBlur = 0
  }

  function drawEnemies() {
    enemies.forEach(e => {
      if (!e.alive) return
      ctx.save()
      ctx.translate(e.x, e.y)
      ctx.rotate(Math.PI)

      const isElite = e.type === 2
      const ew = isElite ? 22 : 16
      const eh = isElite ? 22 : 16
      const mc = isElite ? '#c2410c' : '#dc2626'
      const hc = isElite ? '#fed7aa' : '#fca5a5'

      ctx.shadowColor = mc
      ctx.shadowBlur = isElite ? 10 : 6
      ctx.fillStyle = mc
      ctx.beginPath()
      ctx.moveTo(0, -eh / 2)
      ctx.lineTo(-ew / 2, eh * 0.35)
      ctx.lineTo(-ew * 0.2, eh * 0.1)
      ctx.lineTo(-ew * 0.1, eh / 2)
      ctx.lineTo(0, eh * 0.3)
      ctx.lineTo(ew * 0.1, eh / 2)
      ctx.lineTo(ew * 0.2, eh * 0.1)
      ctx.lineTo(ew / 2, eh * 0.35)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = hc
      ctx.beginPath()
      ctx.ellipse(0, -eh * 0.18, 2.5, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      if (isElite) {
        const fl = 3 + Math.sin(frames * 0.25 + e.x) * 1.5
        ctx.fillStyle = 'rgba(251,146,60,0.7)'
        ctx.beginPath()
        ctx.ellipse(0, eh * 0.35, 3.5, fl, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      if (isElite) {
        const bw = 24
        const bh = 3
        const filled = (e.hp / e.maxHp) * bw
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(e.x - bw / 2, e.y + 14, bw, bh)
        ctx.fillStyle = e.hp > 1 ? '#4ade80' : '#facc15'
        ctx.fillRect(e.x - bw / 2, e.y + 14, filled, bh)
      }
    })
  }

  function drawEBullets() {
    eBullets.forEach(b => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.35, 'rgba(255,80,80,1)')
      g.addColorStop(1, 'rgba(220,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.42)'
    ctx.fillRect(0, 0, W, 22)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`生命 ${pHp}/3`, 8, 15)
    ctx.textAlign = 'right'
    ctx.fillText(`得分 ${score}   Lv.${level}`, W - 8, 15)
  }

  function drawDeadOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f87171'
    ctx.font = 'bold 21px system-ui'
    ctx.fillText('战机被击落了', W / 2, H / 2 - 22)
    ctx.fillStyle = 'rgba(255,255,255,0.78)'
    ctx.font = '13px system-ui'
    ctx.fillText(`得分 ${score}`, W / 2, H / 2 + 6)
    ctx.fillText(`最高等级 Lv.${level}`, W / 2, H / 2 + 26)
  }

  function loop() {
    update()
    ctx.clearRect(0, 0, W, H)
    drawBG()
    drawParticles()
    drawPBullets()
    drawEBullets()
    drawEnemies()
    drawPlayerPlane()
    drawHUD()
    if (state === 'dead') drawDeadOverlay()
    raf = requestAnimationFrame(loop)
  }

  function endSkyFight() {
    cancelAnimationFrame(raf)
    raf = null
    if (window._esportsTestCallback) {
      const cb = window._esportsTestCallback
      window._esportsTestCallback = null
      setTimeout(() => { closeGame(); cb(score) }, 600)
      return
    }
    settleSkyFightResult(score, { fromGame: true, level })
  }

  const origSetSnakeDir = window.setSnakeDir
  window.setSnakeDir = (dx, dy) => {
    if (dx === -1) { keys.left = true; keys.right = false }
    else if (dx === 1) { keys.right = true; keys.left = false }
    else if (dy === -1) { keys.up = true; keys.down = false }
    else if (dy === 1) { keys.down = true; keys.up = false }
  }
  const onPUp = () => { keys.left = false; keys.right = false; keys.up = false; keys.down = false }
  document.addEventListener('pointerup', onPUp)

  const DIR = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' }
  const onKey = e => { if (DIR[e.key]) { keys[DIR[e.key]] = true; e.preventDefault() } }
  const onKeyUp = e => { if (DIR[e.key]) keys[DIR[e.key]] = false }
  document.addEventListener('keydown', onKey)
  document.addEventListener('keyup', onKeyUp)

  const getCanvasPos = (cx, cy) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (cx - rect.left) / rect.width * W,
      y: (cy - rect.top) / rect.height * H,
    }
  }
  const onTouchStart = e => { touchTarget = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY) }
  const onTouchMove = e => {
    touchTarget = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY)
    e.preventDefault()
  }
  const onTouchEnd = () => { touchTarget = null }
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  snakeHandle = {
    stop: () => {
      cancelAnimationFrame(raf)
      raf = null
      if (endTimer) { clearTimeout(endTimer); endTimer = null }
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('pointerup', onPUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      window.setSnakeDir = origSetSnakeDir
      controls.style.display = ''
      if (window._esportsTestCallback) {
        const cb = window._esportsTestCallback
        window._esportsTestCallback = null
        setTimeout(() => cb(0), 100)
      }
    },
  }

  raf = requestAnimationFrame(loop)
}
