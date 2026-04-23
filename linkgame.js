/* ============================================================
   linkgame.js — 记忆翻牌配对打工小游戏
   翻开所有配对方块，通过进度获得最多 500 元零花钱
   打工损耗 2 点精力，只在寒假(2月)和暑假(7,8月)出现
   ============================================================ */

function startLinkGame() {
  if (player.monthStarted && !useEnergy()) return
  if (player.monthStarted && !useEnergy()) return
  markActivityUsed('parttime')
  openLinkGame()
}

function openLinkGame() {
  const overlay  = document.getElementById('game-overlay')
  const canvas   = document.getElementById('game-canvas')
  const infoEl   = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx      = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '打工 💼'
  controls.style.display = 'none'
  overlay.classList.remove('hidden')
  infoEl.textContent = '翻开两张相同的牌配对消除'

  const W = 300, H = 300
  const COLS = 4, ROWS = 4
  const HUD_H = 38
  const CELL_W = W / COLS
  const CELL_H = (H - HUD_H) / ROWS
  const TOTAL_PAIRS = (COLS * ROWS) / 2   // 8
  const TIME_LIMIT  = 120                 // seconds

  const TILES = ['💼', '📋', '💰', '🔧', '📦', '☕', '📚', '🎯']

  const C_BG      = '#f7f4ee'
  const C_SURFACE = '#ffffff'
  const C_BACK    = '#dcd7cf'
  const C_MATCH   = '#e8f0ea'
  const C_ACCENT  = '#3d5a4c'
  const C_BORDER  = '#e2ddd5'
  const C_TEXT    = '#2a2925'
  const C_MUTED   = '#8a8479'

  let cards      = []    // [{tile, state:'hidden'|'revealed'|'matched'}]
  let flipped    = []    // indices of currently revealed (non-matched) cards
  let locked     = false
  let matched    = 0
  let startTime  = Date.now()
  let raf        = null
  let endTimer   = null
  let checkTimer = null
  let timeLimitTimer = null
  let ended      = false

  // ── 初始化 ──

  function initCards() {
    const pool = []
    for (let t = 0; t < TILES.length; t++) pool.push(t, t)
    shuffle(pool)
    cards = pool.map(t => ({ tile: t, state: 'hidden' }))
  }

  // ── 点击处理 ──

  function handleClick(px, py) {
    if (ended || locked) return
    if (py < HUD_H) return
    const col = Math.floor(px / CELL_W)
    const row = Math.floor((py - HUD_H) / CELL_H)
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return
    const idx = row * COLS + col
    const card = cards[idx]
    if (card.state !== 'hidden') return
    if (flipped.includes(idx)) return

    card.state = 'revealed'
    flipped.push(idx)

    if (flipped.length === 2) {
      locked = true
      checkTimer = setTimeout(checkPair, 900)
    }
  }

  function checkPair() {
    if (ended) return
    const [i1, i2] = flipped
    if (cards[i1].tile === cards[i2].tile) {
      cards[i1].state = 'matched'
      cards[i2].state = 'matched'
      matched++
      infoEl.textContent = matched < TOTAL_PAIRS
        ? `配对成功！还剩 ${TOTAL_PAIRS - matched} 对`
        : '全部配对！'
      if (matched >= TOTAL_PAIRS) {
        if (!endTimer) endTimer = setTimeout(doEnd, 700)
      }
    } else {
      cards[i1].state = 'hidden'
      cards[i2].state = 'hidden'
      infoEl.textContent = '翻开两张相同的牌配对消除'
    }
    flipped = []
    locked = false
  }

  // ── 绘制 ──

  function draw() {
    const elapsed   = (Date.now() - startTime) / 1000
    const remaining = Math.max(0, TIME_LIMIT - elapsed)
    const timerFrac = remaining / TIME_LIMIT

    ctx.clearRect(0, 0, W, H)

    // 背景
    ctx.fillStyle = C_BG
    ctx.fillRect(0, 0, W, H)

    // 卡牌
    const PAD = 5
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const card = cards[r * COLS + c]
        const cx = c * CELL_W + PAD
        const cy = HUD_H + r * CELL_H + PAD
        const cw = CELL_W - PAD * 2
        const ch = CELL_H - PAD * 2
        const fontSize = Math.floor(Math.min(cw, ch) * 0.48)

        if (card.state === 'matched') {
          ctx.fillStyle = C_MATCH
          roundRect(ctx, cx, cy, cw, ch, 8)
          ctx.fill()
          ctx.fillStyle = C_ACCENT
          ctx.globalAlpha = 0.35
          ctx.font = `bold ${fontSize}px system-ui`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('✓', cx + cw / 2, cy + ch / 2)
          ctx.globalAlpha = 1
          continue
        }

        const revealed = card.state === 'revealed'

        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.06)'
        roundRect(ctx, cx + 1, cy + 2, cw, ch, 8)
        ctx.fill()

        // 卡面
        ctx.fillStyle = revealed ? C_SURFACE : C_BACK
        roundRect(ctx, cx, cy, cw, ch, 8)
        ctx.fill()

        ctx.strokeStyle = revealed ? C_ACCENT : C_BORDER
        ctx.lineWidth = revealed ? 2 : 1
        roundRect(ctx, cx, cy, cw, ch, 8)
        ctx.stroke()
        ctx.lineWidth = 1

        ctx.font = `${fontSize}px system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (revealed) {
          ctx.fillText(TILES[card.tile], cx + cw / 2, cy + ch / 2)
        } else {
          ctx.fillStyle = '#b8b3aa'
          ctx.font = `bold ${Math.floor(fontSize * 0.75)}px system-ui`
          ctx.fillText('?', cx + cw / 2, cy + ch / 2)
        }
      }
    }

    // ── HUD ──
    ctx.fillStyle = C_SURFACE
    ctx.fillRect(0, 0, W, HUD_H)
    ctx.strokeStyle = C_BORDER
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, HUD_H)
    ctx.lineTo(W, HUD_H)
    ctx.stroke()

    // 进度（左）
    ctx.fillStyle = C_TEXT
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const midY = (HUD_H - 5) / 2
    ctx.fillText(`${matched} / ${TOTAL_PAIRS} 对`, 10, midY)

    // 预计收入
    if (matched > 0) {
      const earn = Math.round(matched / TOTAL_PAIRS * 500)
      ctx.fillStyle = C_ACCENT
      ctx.font = '10px system-ui'
      ctx.fillText(`💰${earn}`, 90, midY)
    }

    // 倒计时（右）
    const mins = Math.floor(remaining / 60)
    const secs = Math.floor(remaining % 60)
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
    ctx.fillStyle = timerFrac > 0.25 ? C_MUTED : '#dc2626'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText(timeStr, W - 10, midY)

    // 进度条
    const barY = HUD_H - 6
    ctx.fillStyle = C_BORDER
    roundRect(ctx, 10, barY, W - 20, 4, 2)
    ctx.fill()
    if (timerFrac > 0) {
      ctx.fillStyle = timerFrac > 0.4 ? C_ACCENT : timerFrac > 0.2 ? '#d97706' : '#dc2626'
      roundRect(ctx, 10, barY, (W - 20) * timerFrac, 4, 2)
      ctx.fill()
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  // ── 主循环 ──

  function loop() {
    draw()
    raf = requestAnimationFrame(loop)
  }

  // ── 结束 ──

  function doEnd() {
    if (ended) return
    ended = true
    cancelAnimationFrame(raf); raf = null
    if (endTimer) { clearTimeout(endTimer); endTimer = null }
    if (checkTimer) { clearTimeout(checkTimer); checkTimer = null }
    if (timeLimitTimer) { clearTimeout(timeLimitTimer); timeLimitTimer = null }

    const earn = Math.round(matched / TOTAL_PAIRS * 500)
    if (player.monthStarted) applyChanges({ money: earn })

    const won = matched >= TOTAL_PAIRS
    setTimeout(() => {
      closeGame()
      if (player.monthStarted) showModal(`
        <div class="modal-title">💼 打工结束</div>
        <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${earn}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 元</span></div>
        <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${won ? '全部配对！🎉' : `配对了 ${matched} / ${TOTAL_PAIRS} 对`}</div>
        <hr class="modal-divider">
        <div class="modal-row"><span>零花钱</span><span class="chg-pos">+${earn}</span></div>
      `)
    }, 600)
  }

  // ── 输入 ──

  const getPos = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect()
    return {
      px: (clientX - rect.left) / rect.width  * W,
      py: (clientY - rect.top)  / rect.height * H,
    }
  }

  const onClick = e => {
    const { px, py } = getPos(e.clientX, e.clientY)
    handleClick(px, py)
  }
  const onTouch = e => {
    e.preventDefault()
    const { px, py } = getPos(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    handleClick(px, py)
  }
  canvas.addEventListener('click', onClick)
  canvas.addEventListener('touchend', onTouch, { passive: false })

  // ── 清理句柄 ──

  snakeHandle = {
    stop: () => {
      if (!ended) doEnd()
      else {
        cancelAnimationFrame(raf); raf = null
        if (endTimer)      { clearTimeout(endTimer);      endTimer      = null }
        if (checkTimer)    { clearTimeout(checkTimer);    checkTimer    = null }
        if (timeLimitTimer){ clearTimeout(timeLimitTimer);timeLimitTimer= null }
      }
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchend', onTouch)
      controls.style.display = ''
    }
  }

  // ── 启动 ──
  initCards()
  timeLimitTimer = setTimeout(doEnd, TIME_LIMIT * 1000)
  raf = requestAnimationFrame(loop)
}
