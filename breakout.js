/* ============================================================
   breakout.js — 打砖块小游戏
   经典 Breakout 玩法：挡板接球，消灭砖块得分
   ============================================================ */

function startBreakout() {
  if (player.monthStarted && !useEnergy()) return
  tryInvite('乒乓球', () => openBreakout())
}

function openBreakout() {
  const overlay  = document.getElementById('game-overlay')
  const canvas   = document.getElementById('game-canvas')
  const infoEl   = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx      = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '乒乓球 🏓'
  controls.style.display = ''
  document.getElementById('dir-up').style.visibility   = 'hidden'
  document.getElementById('dir-down').style.visibility = 'hidden'
  overlay.classList.remove('hidden')
  infoEl.textContent = '← → 移动挡板   别让球掉下去！'

  const W = 300, H = 300

  // ── 砖块布局 ──
  const COLS = 8, ROWS = 5
  const BW = 30, BH = 11, BGAPX = 3, BGAPY = 4
  const BOFFX = (W - (COLS * (BW + BGAPX) - BGAPX)) / 2   // 水平居中
  const BOFFY = 28

  // 各行颜色、分值、血量（顶部最难）
  const ROW_COLOR = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
  const ROW_PTS   = [30, 20, 15, 10, 5]
  const ROW_HP    = [2, 2, 1, 1, 1]

  // ── 挡板 ──
  const PAD_H = 9, PAD_Y = H - 18, PAD_SPEED = 5
  const PAD_W0 = 60
  let padX = (W - PAD_W0) / 2
  const padW = PAD_W0

  // ── 球 ──
  const BALL_R = 5.5
  let bx = W / 2, by = PAD_Y - BALL_R - 1
  const initSpeed = 2.55
  let bdx = initSpeed * 0.55   // 初始向右上方
  let bdy = -initSpeed * 0.835

  // ── 砖块数组 ──
  function makeBricks() {
    const arr = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        arr.push({
          x: BOFFX + c * (BW + BGAPX),
          y: BOFFY + r * (BH + BGAPY),
          row: r, hp: ROW_HP[r], maxHp: ROW_HP[r], alive: true,
        })
      }
    }
    return arr
  }

  let bricks       = makeBricks()
  let score        = 0
  let broken       = 0   // 已打掉数量
  const TOTAL      = COLS * ROWS
  let state        = 'playing'   // 'playing' | 'dead' | 'win'
  let frames       = 0
  let raf          = null
  let endTimer     = null
  let flashFrames  = 0  // 砖块被击中时的闪光帧

  // ── 键盘状态 ──
  const keys = { left: false, right: false }

  // ── 更新逻辑 ──

  function update() {
    if (state !== 'playing') return
    frames++
    if (flashFrames > 0) flashFrames--

    // 挡板移动（键盘 / 方向键按钮）
    if (keys.left)  padX = Math.max(0, padX - PAD_SPEED)
    if (keys.right) padX = Math.min(W - padW, padX + PAD_SPEED)

    // 球移动
    bx += bdx
    by += bdy

    // 左右墙壁
    if (bx - BALL_R <= 0) { bx = BALL_R; bdx =  Math.abs(bdx) }
    if (bx + BALL_R >= W) { bx = W - BALL_R; bdx = -Math.abs(bdx) }
    // 顶墙
    if (by - BALL_R <= 0) { by = BALL_R; bdy = Math.abs(bdy) }

    // 球落出底部 → 失败
    if (by - BALL_R > H) {
      state = 'dead'
      if (!endTimer) endTimer = setTimeout(endBreakout, 1900)
      return
    }

    // 挡板碰撞
    if (
      bdy > 0 &&
      by + BALL_R >= PAD_Y &&
      by + BALL_R <= PAD_Y + PAD_H + Math.abs(bdy) &&  // 防止高速穿透
      bx >= padX - BALL_R &&
      bx <= padX + padW + BALL_R
    ) {
      by = PAD_Y - BALL_R
      // 根据击打位置改变反弹角度（-1~1）
      const hit   = Math.max(-1, Math.min(1, (bx - (padX + padW / 2)) / (padW / 2)))
      const angle = hit * (Math.PI / 3.2)   // 最大 ≈ 56°
      const spd   = Math.hypot(bdx, bdy)
      bdx = spd * Math.sin(angle)
      bdy = -Math.abs(spd * Math.cos(angle))
      // 防止球近乎水平
      if (Math.abs(bdy) < spd * 0.32) bdy = -spd * 0.32
    }

    // 砖块碰撞（每帧最多碰一块，防止隧穿问题）
    let hit = false
    for (const b of bricks) {
      if (!b.alive || hit) continue
      const bRight = b.x + BW, bBot = b.y + BH
      if (bx + BALL_R > b.x && bx - BALL_R < bRight &&
          by + BALL_R > b.y && by - BALL_R < bBot) {

        hit = true
        b.hp--
        if (b.hp <= 0) {
          b.alive = false
          score  += ROW_PTS[b.row]
          broken++
          flashFrames = 4

          // 每消灭 5 块加速一次
          if (broken % 5 === 0) {
            const spd = Math.hypot(bdx, bdy)
            const newSpd = Math.min(5.1, spd + 0.26)
            const ratio  = newSpd / spd
            bdx *= ratio; bdy *= ratio
          }
        } else {
          flashFrames = 2  // 受击但未消灭
        }

        // 判断碰撞面：取四个方向中重叠最小的
        const overL = bx + BALL_R - b.x
        const overR = bRight - (bx - BALL_R)
        const overT = by + BALL_R - b.y
        const overB = bBot  - (by - BALL_R)
        if (Math.min(overL, overR) < Math.min(overT, overB)) {
          bdx = overL < overR ? -Math.abs(bdx) : Math.abs(bdx)
        } else {
          bdy = overT < overB ? -Math.abs(bdy) : Math.abs(bdy)
        }
      }
    }

    // 全部消灭 → 胜利
    if (broken >= TOTAL) {
      state = 'win'
      if (!endTimer) endTimer = setTimeout(endBreakout, 2000)
    }
  }

  // ── 绘制 ──

  function drawBG() {
    ctx.fillStyle = '#0d1526'
    ctx.fillRect(0, 0, W, H)
    // 暗格线（装饰）
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y < H; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }
  }

  function drawBricks() {
    bricks.forEach(b => {
      if (!b.alive) return
      const damaged = b.hp < b.maxHp

      // 受伤状态颜色变暗
      ctx.globalAlpha = damaged ? 0.48 : 1

      // 砖块主体
      ctx.fillStyle = ROW_COLOR[b.row]
      ctx.fillRect(b.x, b.y, BW, BH)

      // 顶部高光
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.fillRect(b.x, b.y, BW, 2)

      // 底部阴影
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(b.x, b.y + BH - 2, BW, 2)

      ctx.globalAlpha = 1

      // 受击闪光
      if (damaged && flashFrames > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.fillRect(b.x, b.y, BW, BH)
      }
    })
  }

  function drawPaddle() {
    // 发光效果
    ctx.shadowColor = '#60a5fa'
    ctx.shadowBlur  = 12
    // 主体
    ctx.fillStyle = '#93c5fd'
    ctx.fillRect(padX, PAD_Y, padW, PAD_H)
    ctx.shadowBlur = 0
    // 顶部高光条
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillRect(padX, PAD_Y, padW, 3)
  }

  function drawBall() {
    ctx.shadowColor = 'rgba(255,255,255,0.9)'
    ctx.shadowBlur  = 10
    ctx.fillStyle   = '#ffffff'
    ctx.beginPath()
    ctx.arc(bx, by, BALL_R, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    // 高光小圆点
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(bx - BALL_R * 0.3, by - BALL_R * 0.3, BALL_R * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, W, 22)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'
    ctx.fillText(`分数  ${score}`, 10, 15)
    ctx.textAlign = 'right'
    ctx.fillText(`剩余 ${TOTAL - broken} 块`, W - 8, 15)
  }

  function drawOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.62)'
    ctx.fillRect(0, 0, W, H)

    if (state === 'dead') {
      ctx.fillStyle = '#f87171'
      ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('球掉了！', W / 2, H / 2 - 20)
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = '13px system-ui'
      ctx.fillText(`得分：${score} 分`, W / 2, H / 2 + 8)
      ctx.fillText(`消灭了 ${broken} / ${TOTAL} 块`, W / 2, H / 2 + 28)
    } else {
      ctx.fillStyle = '#fcd34d'
      ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('🎉 全部消灭！', W / 2, H / 2 - 20)
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '13px system-ui'
      ctx.fillText(`最终得分：${score} 分`, W / 2, H / 2 + 10)
    }
  }

  // ── 主循环 ──

  function loop() {
    update()
    ctx.clearRect(0, 0, W, H)
    drawBG()
    drawBricks()
    drawPaddle()
    drawBall()
    drawHUD()
    if (state !== 'playing') drawOverlay()
    raf = requestAnimationFrame(loop)
  }

  // ── 结束 ──

  function endBreakout() {
    cancelAnimationFrame(raf); raf = null
    const MAX_SCORE = 640
    const hg = Math.round(Math.min(score, MAX_SCORE) / MAX_SCORE * 5)
    const mg = Math.round(Math.min(score, MAX_SCORE) / MAX_SCORE * 10)
    const win = state === 'win'
    if (player.monthStarted) applyChanges({ mental: mg, health: hg })
    setTimeout(() => {
      closeGame()
      if (player.monthStarted) showModal(`
        <div class="modal-title">${win ? '🎉 全部通关！' : '🏓 乒乓球结束'}</div>
        <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${score}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 分</span></div>
        <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">消灭了 ${broken} / ${TOTAL} 块</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>身体健康</span><span class="chg-pos">+${hg}</span></div>
        <div class="modal-row"><span>心理健康</span><span class="chg-pos">+${mg}</span></div>
      `)
    }, 600)
  }

  // ── 输入 ──

  // 键盘 ← →
  const onKey   = e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') { keys.left  = true;  e.preventDefault() }
    if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true;  e.preventDefault() }
  }
  const onKeyUp = e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left  = false
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false
  }
  document.addEventListener('keydown', onKey)
  document.addEventListener('keyup',   onKeyUp)

  // 方向键按钮（按下设 keys，抬手清除）
  const origSetSnakeDir = window.setSnakeDir
  window.setSnakeDir = (dx, dy) => {
    keys.left  = dx === -1
    keys.right = dx ===  1
  }
  const onPointerUp = () => { keys.left = false; keys.right = false }
  document.addEventListener('pointerup', onPointerUp)

  // 触屏：拖动画面直接移动挡板
  const onTouchMove = e => {
    const rect = canvas.getBoundingClientRect()
    const tx   = (e.touches[0].clientX - rect.left) / rect.width * W
    padX = Math.max(0, Math.min(W - padW, tx - padW / 2))
    e.preventDefault()
  }
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })

  // 鼠标拖动画面移动挡板
  const onMouseMove = e => {
    if (e.buttons === 0) return
    const rect = canvas.getBoundingClientRect()
    const mx   = (e.clientX - rect.left) / rect.width * W
    padX = Math.max(0, Math.min(W - padW, mx - padW / 2))
  }
  canvas.addEventListener('mousemove', onMouseMove)

  // ── 清理句柄 ──

  snakeHandle = {
    stop: () => {
      cancelAnimationFrame(raf); raf = null
      if (endTimer) { clearTimeout(endTimer); endTimer = null }
      document.removeEventListener('keydown',   onKey)
      document.removeEventListener('keyup',     onKeyUp)
      document.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('touchmove',   onTouchMove)
      canvas.removeEventListener('mousemove',   onMouseMove)
      window.setSnakeDir = origSetSnakeDir
      controls.style.display = ''
      document.getElementById('dir-up').style.visibility   = ''
      document.getElementById('dir-down').style.visibility = ''
    }
  }

  raf = requestAnimationFrame(loop)
}
