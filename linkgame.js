/* ============================================================
   linkgame.js — 记忆翻牌配对打工小游戏
   翻开所有配对方块，通过进度获得最多 500 元零花钱
   打工损耗 2 点精力，只在寒假(2月)和暑假(7,8月)出现
   ============================================================ */

function startLinkGame() {
  showGameTutorial('parttime', () => {
    if (player.monthStarted && !useEnergy()) return
    if (player.monthStarted && !useEnergy()) return
    markActivityUsed('parttime')
    openLinkGame()
  })
}

function startLinkGame() {
  startScoredActivity({
    key: 'parttime',
    tutorialKey: 'parttime',
    energyCost: 2,
    onReplay: () => {
      openLinkGame()
    },
    onQuickFinish: (bestScore) => {
      settlePartTimeResult(bestScore)
    },
  })
}

/* function settlePartTimeResult(earn, options = {}) {
  rememberActivityBestScore('parttime', earn)
  if (player.monthStarted) applyChanges({ money: earn })

  const detailText = options.matched == null
    ? '一键通关直接按历史最高收益结算。'
    : options.won
      ? '鍏ㄩ儴閰嶅锛侌煄?
      : `閰嶅浜?${options.matched} / ${options.total} 瀵?`

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">馃捈 鎵撳伐缁撴潫</div>
      <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${earn}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 鍏?/span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${detailText}</div>
      <hr class="modal-divider">
      <div class="modal-row"><span>闆惰姳閽?/span><span class="chg-pos">+${earn}</span></div>
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

function settlePartTimeResult(earn, options = {}) {
  rememberActivityBestScore('parttime', earn)
  if (player.monthStarted) applyChanges({ money: earn })

  const detailText = options.matched == null
    ? '本次直接按历史最高收入结算。'
    : options.won
      ? '你成功完成了全部配对'
      : `本次完成 ${options.matched} / ${options.total} 组配对`

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">打工结束</div>
      <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${earn}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> ?</span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${detailText}</div>
      <hr class="modal-divider">
      <div class="modal-row"><span>???</span><span class="chg-pos">+${earn}</span></div>
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

function openLinkGame() {
  const overlay  = document.getElementById('game-overlay')
  const canvas   = document.getElementById('game-canvas')
  const infoEl   = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx      = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '??'
  controls.style.display = 'none'
  overlay.classList.remove('hidden')
  infoEl.textContent = '翻牌配对，赚取零花钱'

  const W = 300, H = 300
  const COLS = 4, ROWS = 4
  const HUD_H = 38
  const CELL_W = W / COLS
  const CELL_H = (H - HUD_H) / ROWS
  const TOTAL_PAIRS = (COLS * ROWS) / 2   // 8
  const TIME_LIMIT  = 60                  // seconds

  const TILES = ['🍔', '🎮', '🎧', '📱', '🧋', '🎁', '🚌', '💼']

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
        ? `继续翻牌，还差 ${TOTAL_PAIRS - matched} 组`
        : '全部配对完成'
      if (matched >= TOTAL_PAIRS) {
        if (!endTimer) endTimer = setTimeout(doEnd, 700)
      }
    } else {
      cards[i1].state = 'hidden'
      cards[i2].state = 'hidden'
      infoEl.textContent = '继续翻牌完成配对'
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
          ctx.fillText('?', cx + cw / 2, cy + ch / 2)
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
    ctx.fillText(`${matched} / ${TOTAL_PAIRS} ?`, 10, midY)

    // 预计收入
    if (matched > 0) {
      const earn = Math.round(matched / TOTAL_PAIRS * 500)
      ctx.fillStyle = C_ACCENT
      ctx.font = '10px system-ui'
      ctx.fillText(`?? ${earn}`, 90, midY)
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
    cancelAnimationFrame(raf)
    raf = null
    if (endTimer) { clearTimeout(endTimer); endTimer = null }
    if (checkTimer) { clearTimeout(checkTimer); checkTimer = null }
    if (timeLimitTimer) { clearTimeout(timeLimitTimer); timeLimitTimer = null }

    const earn = Math.round(matched / TOTAL_PAIRS * 500)
    settlePartTimeResult(earn, {
      fromGame: true,
      matched,
      total: TOTAL_PAIRS,
      won: matched >= TOTAL_PAIRS,
    })
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

function startLinkGame() {
  startScoredActivity({
    key: 'parttime',
    tutorialKey: 'parttime',
    energyCost: 2,
    onReplay: () => {
      openLinkGame()
    },
    onQuickFinish: (bestScore) => {
      settlePartTimeResult(bestScore)
    },
  })
}

function settlePartTimeResult(earn, options = {}) {
  rememberActivityBestScore('parttime', earn)
  if (player.monthStarted) applyChanges({ money: earn })

  const detailText = options.matched == null
    ? '本次直接按历史最高收入结算。'
    : options.won
      ? '你成功完成了全部配对'
      : `本次完成 ${options.matched} / ${options.total} 组配对`

  const showResult = () => {
    if (player.monthStarted) showModal(`
      <div class="modal-title">打工结束</div>
      <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${earn}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 元</span></div>
      <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">${detailText}</div>
      <hr class="modal-divider">
      <div class="modal-row"><span>零花钱</span><span class="chg-pos">+${earn}</span></div>
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

function openLinkGame() {
  const overlay = document.getElementById('game-overlay')
  const canvas = document.getElementById('game-canvas')
  const infoEl = document.getElementById('game-info')
  const controls = document.getElementById('snake-controls')
  const ctx = canvas.getContext('2d')

  document.getElementById('game-title').textContent = '打工'
  controls.style.display = 'none'
  overlay.classList.remove('hidden')
  infoEl.textContent = '翻牌配对，赚取零花钱'

  const W = 300
  const H = 300
  const COLS = 4
  const ROWS = 4
  const HUD_H = 38
  const CELL_W = W / COLS
  const CELL_H = (H - HUD_H) / ROWS
  const TOTAL_PAIRS = (COLS * ROWS) / 2
  const TIME_LIMIT = 60

  const TILES = ['🍔', '🎮', '🎧', '📱', '🧋', '🎁', '🚌', '💼']

  const C_BG = '#f7f4ee'
  const C_SURFACE = '#ffffff'
  const C_BACK = '#dcd7cf'
  const C_MATCH = '#e8f0ea'
  const C_ACCENT = '#3d5a4c'
  const C_BORDER = '#e2ddd5'
  const C_TEXT = '#2a2925'
  const C_MUTED = '#8a8479'

  let cards = []
  let flipped = []
  let locked = false
  let matched = 0
  let startTime = Date.now()
  let raf = null
  let endTimer = null
  let checkTimer = null
  let timeLimitTimer = null
  let ended = false

  function initCards() {
    const pool = []
    for (let t = 0; t < TILES.length; t++) pool.push(t, t)
    shuffle(pool)
    cards = pool.map(t => ({ tile: t, state: 'hidden' }))
  }

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
        ? `还剩 ${TOTAL_PAIRS - matched} 组配对`
        : '全部配对完成'
      if (matched >= TOTAL_PAIRS) {
        if (!endTimer) endTimer = setTimeout(doEnd, 700)
      }
    } else {
      cards[i1].state = 'hidden'
      cards[i2].state = 'hidden'
      infoEl.textContent = '继续翻牌完成配对'
    }
    flipped = []
    locked = false
  }

  function draw() {
    const elapsed = (Date.now() - startTime) / 1000
    const remaining = Math.max(0, TIME_LIMIT - elapsed)
    const timerFrac = remaining / TIME_LIMIT

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = C_BG
    ctx.fillRect(0, 0, W, H)

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
          ctx.fillText('√', cx + cw / 2, cy + ch / 2)
          ctx.globalAlpha = 1
          continue
        }

        const revealed = card.state === 'revealed'
        ctx.fillStyle = 'rgba(0,0,0,0.06)'
        roundRect(ctx, cx + 1, cy + 2, cw, ch, 8)
        ctx.fill()

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
          ctx.fillStyle = C_TEXT
          ctx.fillText(TILES[card.tile], cx + cw / 2, cy + ch / 2)
        } else {
          ctx.fillStyle = '#b8b3aa'
          ctx.font = `bold ${Math.floor(fontSize * 0.75)}px system-ui`
          ctx.fillText('？', cx + cw / 2, cy + ch / 2)
        }
      }
    }

    ctx.fillStyle = C_SURFACE
    ctx.fillRect(0, 0, W, HUD_H)
    ctx.strokeStyle = C_BORDER
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, HUD_H)
    ctx.lineTo(W, HUD_H)
    ctx.stroke()

    ctx.fillStyle = C_TEXT
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const midY = (HUD_H - 5) / 2
    ctx.fillText(`${matched} / ${TOTAL_PAIRS} 组`, 10, midY)

    if (matched > 0) {
      const earn = Math.round(matched / TOTAL_PAIRS * 500)
      ctx.fillStyle = C_ACCENT
      ctx.font = '10px system-ui'
      ctx.fillText(`收入 ${earn}`, 90, midY)
    }

    const mins = Math.floor(remaining / 60)
    const secs = Math.floor(remaining % 60)
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
    ctx.fillStyle = timerFrac > 0.25 ? C_MUTED : '#dc2626'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText(timeStr, W - 10, midY)

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

  function roundRect(ctx2, x, y, w, h, r) {
    ctx2.beginPath()
    ctx2.moveTo(x + r, y)
    ctx2.lineTo(x + w - r, y)
    ctx2.arcTo(x + w, y, x + w, y + r, r)
    ctx2.lineTo(x + w, y + h - r)
    ctx2.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx2.lineTo(x + r, y + h)
    ctx2.arcTo(x, y + h, x, y + h - r, r)
    ctx2.lineTo(x, y + r)
    ctx2.arcTo(x, y, x + r, y, r)
    ctx2.closePath()
  }

  function loop() {
    draw()
    raf = requestAnimationFrame(loop)
  }

  function doEnd() {
    if (ended) return
    ended = true
    cancelAnimationFrame(raf)
    raf = null
    if (endTimer) { clearTimeout(endTimer); endTimer = null }
    if (checkTimer) { clearTimeout(checkTimer); checkTimer = null }
    if (timeLimitTimer) { clearTimeout(timeLimitTimer); timeLimitTimer = null }

    const earn = Math.round(matched / TOTAL_PAIRS * 500)
    settlePartTimeResult(earn, {
      fromGame: true,
      matched,
      total: TOTAL_PAIRS,
      won: matched >= TOTAL_PAIRS,
    })
  }

  const getPos = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect()
    return {
      px: (clientX - rect.left) / rect.width * W,
      py: (clientY - rect.top) / rect.height * H,
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

  snakeHandle = {
    stop: () => {
      if (!ended) doEnd()
      else {
        cancelAnimationFrame(raf)
        raf = null
        if (endTimer) { clearTimeout(endTimer); endTimer = null }
        if (checkTimer) { clearTimeout(checkTimer); checkTimer = null }
        if (timeLimitTimer) { clearTimeout(timeLimitTimer); timeLimitTimer = null }
      }
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchend', onTouch)
      controls.style.display = ''
    },
  }

  initCards()
  timeLimitTimer = setTimeout(doEnd, TIME_LIMIT * 1000)
  raf = requestAnimationFrame(loop)
}
