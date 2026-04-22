/* ============================================================
   basketball.js — 篮球小游戏
   5次投篮：每次先锁定方向，再锁定力度
   ============================================================ */

function startBasketball() {
  if (player.monthStarted && !useEnergy()) return
  tryInvite('篮球', () => openBasketball())
}

function openBasketball() {
  const overlay  = document.getElementById('game-overlay')
  const canvas   = document.getElementById('game-canvas')
  const infoEl   = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx      = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '篮球 🏀'
  controls.style.display = 'none'
  overlay.classList.remove('hidden')
  infoEl.textContent = '点击画面 — 先锁方向，再锁力度'

  const W = 300, H = 300, CX = W / 2
  const TOTAL = 5

  // ── 场地几何 ──
  const HOOP_Y = 68, HOOP_R = 16
  const BX0 = CX, BY0 = 208          // 球的起始位置

  // 方向条（水平，靠近底部）
  const DBW = 162, DBH = 12
  const DBX = (W - DBW) / 2, DBY = H - 54

  // 力度条（竖直，右侧）
  const PBW = 13, PBH = 118
  const PBX = W - 22, PBY = (H - PBH) / 2

  // ── 游戏状态 ──
  let shot = 0, made = 0
  let phase = 'dir'  // dir | pow | anim | wait | done

  let dv = 0.3, ds = 0.027, dk = null   // 方向：值/速度/锁定
  let pv = 0.1, ps = 1,    pk = null    // 力度：值/方向/锁定

  let at = 0, aok = false               // 动画进度 / 是否进球
  let raf = null

  // ── 绘制辅助 ──

  function zoneClr(pos, dimmed) {
    // pos: 0..1，中间绿色，两侧黄色/红色
    let c = (pos < 0.2 || pos > 0.8)    ? '#d45555'
           : (pos < 0.35 || pos > 0.65) ? '#e09040'
           : '#4caf72'
    return dimmed ? c + '55' : c
  }

  function drawCourt() {
    // 木地板
    ctx.fillStyle = '#a83e14'
    ctx.fillRect(0, 0, W, H)
    for (let x = 0; x < W; x += 22) {
      ctx.fillStyle = 'rgba(0,0,0,0.04)'
      ctx.fillRect(x, 0, 11, H)
    }
    // 场地线
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 1.5
    // 三秒区
    ctx.strokeRect(CX - 42, HOOP_Y + HOOP_R + 4, 84, 106)
    // 罚球弧
    ctx.beginPath()
    ctx.arc(CX, HOOP_Y + HOOP_R + 110, 42, Math.PI, 0)
    ctx.stroke()
    // 三分线（弧形）
    ctx.beginPath()
    ctx.arc(CX, H + 12, 116, -Math.PI * 0.91, -Math.PI * 0.09)
    ctx.stroke()
  }

  function drawHoop() {
    // 篮板
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.fillRect(CX - 30, HOOP_Y - 30, 60, 5)
    // 篮板小方框
    ctx.strokeStyle = '#f07030'
    ctx.lineWidth = 1.5
    ctx.strokeRect(CX - 10, HOOP_Y - 28, 20, 16)
    // 篮圈
    ctx.strokeStyle = '#e05818'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(CX, HOOP_Y, HOOP_R, 0, Math.PI * 2)
    ctx.stroke()
    // 网
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 1
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(CX + i * (HOOP_R / 2.5), HOOP_Y + 2)
      ctx.lineTo(CX + i * (HOOP_R / 4.5), HOOP_Y + 17)
      ctx.stroke()
    }
    ;[[HOOP_R, 8], [HOOP_R * .7, 14], [HOOP_R * .35, 19]].forEach(([hw, y]) => {
      ctx.beginPath()
      ctx.moveTo(CX - hw, HOOP_Y + y)
      ctx.lineTo(CX + hw, HOOP_Y + y)
      ctx.stroke()
    })
  }

  function drawBall(x, y) {
    const r = 13
    const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r)
    g.addColorStop(0, '#ffa030')
    g.addColorStop(1, '#c84800')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke()
    ctx.beginPath(); ctx.arc(x - r * .3, y, r, -.55, .55);                 ctx.stroke()
    ctx.beginPath(); ctx.arc(x + r * .3, y, r, Math.PI - .55, Math.PI + .55); ctx.stroke()
  }

  function drawDirBar() {
    const locked = dk !== null
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = zoneClr(i / 80, locked)
      ctx.fillRect(DBX + i / 80 * DBW, DBY, DBW / 80 + .5, DBH)
    }
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1
    ctx.strokeRect(DBX, DBY, DBW, DBH)

    // 指针（三角形）
    const nx = DBX + ((locked ? dk : dv) + 1) / 2 * DBW
    ctx.fillStyle = locked ? 'rgba(255,255,255,.4)' : 'white'
    ctx.beginPath(); ctx.moveTo(nx, DBY - 1)
    ctx.lineTo(nx - 6, DBY - 13); ctx.lineTo(nx + 6, DBY - 13)
    ctx.closePath(); ctx.fill()
    if (!locked) {
      ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; ctx.stroke()
    }

    ctx.fillStyle = 'rgba(255,255,255,.85)'
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'
    ctx.fillText(locked ? '方向 ✓' : '点击锁定方向', DBX + DBW / 2, DBY + DBH + 14)
  }

  function drawPowBar() {
    const locked = pk !== null
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = zoneClr(i / 80, locked)
      ctx.fillRect(PBX, PBY + i / 80 * PBH, PBW, PBH / 80 + .5)
    }
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1
    ctx.strokeRect(PBX, PBY, PBW, PBH)

    // 指针（向左的三角形）
    const ny = PBY + (1 - (locked ? pk : pv)) * PBH
    ctx.fillStyle = locked ? 'rgba(255,255,255,.4)' : 'white'
    ctx.beginPath(); ctx.moveTo(PBX - 1, ny)
    ctx.lineTo(PBX - 11, ny - 5); ctx.lineTo(PBX - 11, ny + 5)
    ctx.closePath(); ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,.85)'
    ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('力度', PBX + PBW / 2, PBY - 7)
    if (locked) ctx.fillText('✓', PBX + PBW / 2, PBY + PBH + 14)
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,.42)'
    ctx.fillRect(6, 6, 104, 22)
    ctx.fillStyle = 'white'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'
    ctx.fillText(`第 ${shot + 1}/5 次   进 ${made} 球`, 11, 21)
  }

  function drawResultMsg() {
    const bg = aok ? 'rgba(28,145,65,.9)' : 'rgba(185,38,38,.9)'
    ctx.fillStyle = bg
    ctx.fillRect(CX - 56, 130, 112, 38)
    ctx.fillStyle = 'white'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'
    ctx.fillText(aok ? '🏀 进球！' : '没中！', CX, 154)
  }

  // ── 逻辑 ──

  function calcSuccess() {
    const dirPos = (dk + 1) / 2        // 0..1 on the direction bar
    const powPos = 1 - pk              // 0..1 on the power bar
    const dirGreen = dirPos >= 0.35 && dirPos <= 0.65
    const powGreen = powPos >= 0.35 && powPos <= 0.65
    return dirGreen && powGreen
  }

  // ── 渲染 ──

  function render() {
    ctx.clearRect(0, 0, W, H)
    drawCourt(); drawHoop()

    if (phase === 'dir' || phase === 'pow') {
      drawBall(BX0, BY0)
      drawDirBar()
      if (phase === 'pow') drawPowBar()

    } else if (phase === 'anim' || phase === 'wait') {
      const bx = BX0 + dk * 78 * at
      const by = BY0 + (HOOP_Y - BY0) * at - 88 * Math.sin(Math.PI * at)
      drawBall(bx, by)
      drawDirBar(); drawPowBar()
      if (phase === 'wait') drawResultMsg()
    }

    drawHUD()
  }

  // ── 主循环 ──

  function loop() {
    if (phase === 'dir') {
      dv += ds
      if (dv >= 1)  { dv =  1; ds *= -1 }
      if (dv <= -1) { dv = -1; ds *= -1 }

    } else if (phase === 'pow') {
      pv += 0.018 * ps
      if (pv >= 1) { pv = 1; ps = -1 }
      if (pv <= 0) { pv = 0; ps =  1 }

    } else if (phase === 'anim') {
      at += 0.04
      if (at >= 1) {
        at = 1; phase = 'wait'; render()
        setTimeout(() => {
          if (shot >= TOTAL - 1) { phase = 'done'; finish() }
          else { shot++; resetShot(); raf = requestAnimationFrame(loop) }
        }, 1050)
        return
      }
    }

    render()
    if (phase !== 'done' && phase !== 'wait') raf = requestAnimationFrame(loop)
  }

  function resetShot() {
    phase = 'dir'; dk = null; pk = null
    dv = (Math.random() * 2 - 1) * 0.4
    ds = (0.024 + Math.random() * 0.018) * (Math.random() > .5 ? 1 : -1)
    pv = Math.random() * 0.25; ps = 1; at = 0
  }

  // ── 输入 ──

  function tap() {
    if (phase === 'dir') {
      dk = dv; phase = 'pow'
    } else if (phase === 'pow') {
      pk = pv; aok = calcSuccess()
      if (aok) made++
      phase = 'anim'; at = 0
    }
  }

  const onKey = e => {
    if (e.key === ' ' || e.key === 'Enter') { tap(); e.preventDefault() }
  }
  canvas.addEventListener('pointerdown', tap)
  document.addEventListener('keydown', onKey)

  // ── 结束 ──

  function finish() {
    const hg = Math.round(made / TOTAL * 5)
    const mg = Math.round(made / TOTAL * 5)
    if (player.monthStarted) applyChanges({ mental: mg, health: hg })
    setTimeout(() => {
      closeGame()
      if (player.monthStarted) showModal(`
        <div class="modal-title">🏀 篮球结束</div>
        <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0;">${made}<span style="font-size:15px;font-weight:500;color:var(--text-muted)"> / ${TOTAL} 进球</span></div>
        <hr class="modal-divider">
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hg}</span></div>
        <div class="modal-row"><span>心理健康</span><span class="chg-pos">+${mg}</span></div>
      `)
    }, 700)
  }

  // ── 初始化 ──

  snakeHandle = {
    stop: () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', tap)
      document.removeEventListener('keydown', onKey)
      controls.style.display = ''
    }
  }

  dv = (Math.random() * 2 - 1) * 0.3
  ds = 0.027 * (Math.random() > .5 ? 1 : -1)
  raf = requestAnimationFrame(loop)
}
