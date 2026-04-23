/* ============================================================
   linkgame.js — 连连看打工小游戏
   消除所有配对方块，通过进度获得最多 500 元零花钱
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
  infoEl.textContent = '点击两个相同图标消除   路径不超过两个转角'

  const W = 300, H = 300
  const COLS = 6, ROWS = 4
  const HUD_H = 28
  const CELL_W = Math.floor(W / COLS)       // 50
  const CELL_H = Math.floor((H - HUD_H) / ROWS)  // 68
  const TOTAL_PAIRS = (COLS * ROWS) / 2     // 12
  const TOTAL = COLS * ROWS                 // 24

  const TILES = ['💼', '📋', '💰', '🔧', '📦', '☕']

  // grid[r][c] = tile index (1-6) or 0 if empty
  let grid = []
  let selected = null   // {r, c}
  let matched  = 0
  let flashPairs = []   // [{r1,c1,r2,c2, timer}] for match animation
  let raf  = null
  let endTimer = null
  let ended = false

  // ── 初始化网格 ──

  function initGrid() {
    // 每种 tile 放 4 个（6种 × 4 = 24 = 6×4）
    let pool = []
    for (let t = 0; t < TILES.length; t++) {
      for (let k = 0; k < 4; k++) pool.push(t + 1)
    }
    shuffle(pool)
    grid = []
    for (let r = 0; r < ROWS; r++) {
      grid[r] = []
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = pool[r * COLS + c]
      }
    }
  }

  // ── 路径检测（≤2个转角，边界外可走） ──

  // 判断从 (r1,c1) 到 (r2,c2) 沿直线是否畅通（不经过其他非空格）
  // 允许行/列超出 [0, ROWS/COLS-1]（虚拟边框行列）
  function lineOK(r1, c1, r2, c2) {
    if (r1 === r2) {
      const minC = Math.min(c1, c2), maxC = Math.max(c1, c2)
      for (let c = minC + 1; c < maxC; c++) {
        if (r1 >= 0 && r1 < ROWS && c >= 0 && c < COLS && grid[r1][c] !== 0) return false
      }
      return true
    }
    if (c1 === c2) {
      const minR = Math.min(r1, r2), maxR = Math.max(r1, r2)
      for (let r = minR + 1; r < maxR; r++) {
        if (r >= 0 && r < ROWS && c1 >= 0 && c1 < COLS && grid[r][c1] !== 0) return false
      }
      return true
    }
    return false
  }

  // 0弯直连
  function canConnect0(r1, c1, r2, c2) {
    if (r1 !== r2 && c1 !== c2) return false
    return lineOK(r1, c1, r2, c2)
  }

  // 1弯（L形）通过两个可能的转角点
  function canConnect1(r1, c1, r2, c2) {
    // 转角 (r1, c2)
    if ((r1 !== r2 || c1 !== c2) &&
        (grid[r1][c2] === 0 || (r1 === r2 && c1 === c2)) &&
        lineOK(r1, c1, r1, c2) && lineOK(r1, c2, r2, c2)) return true
    // 转角 (r2, c1)
    if ((grid[r2][c1] === 0 || (r1 === r2 && c1 === c2)) &&
        lineOK(r1, c1, r2, c1) && lineOK(r2, c1, r2, c2)) return true
    return false
  }

  // 2弯（Z形/U形）：通过边框虚拟行/列扫描
  function canConnect2(r1, c1, r2, c2) {
    // 扫描同行连接（水平中继行）
    for (let r = -1; r <= ROWS; r++) {
      if (r === r1 && r === r2) continue
      // 路径：(r1,c1) → (r,c1) → (r,c2) → (r2,c2)
      if (lineOK(r1, c1, r, c1) && lineOK(r, c1, r, c2) && lineOK(r, c2, r2, c2)) return true
    }
    // 扫描同列连接（垂直中继列）
    for (let c = -1; c <= COLS; c++) {
      if (c === c1 && c === c2) continue
      if (lineOK(r1, c1, r1, c) && lineOK(r1, c, r2, c) && lineOK(r2, c, r2, c2)) return true
    }
    return false
  }

  function canMatch(r1, c1, r2, c2) {
    if (r1 === r2 && c1 === c2) return false
    if (grid[r1][c1] === 0 || grid[r2][c2] === 0) return false
    if (grid[r1][c1] !== grid[r2][c2]) return false
    return canConnect0(r1, c1, r2, c2) ||
           canConnect1(r1, c1, r2, c2) ||
           canConnect2(r1, c1, r2, c2)
  }

  // ── 检测是否还有可消除的对子 ──

  function hasMove() {
    for (let r1 = 0; r1 < ROWS; r1++) {
      for (let c1 = 0; c1 < COLS; c1++) {
        if (grid[r1][c1] === 0) continue
        for (let r2 = 0; r2 < ROWS; r2++) {
          for (let c2 = 0; c2 < COLS; c2++) {
            if (r1 === r2 && c1 === c2) continue
            if (canMatch(r1, c1, r2, c2)) return true
          }
        }
      }
    }
    return false
  }

  // ── 重新排列（保留剩余方块，打乱位置） ──

  function reshuffle() {
    let remaining = []
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (grid[r][c] !== 0) remaining.push(grid[r][c])

    shuffle(remaining)
    let idx = 0
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (grid[r][c] !== 0) grid[r][c] = remaining[idx++]

    infoEl.textContent = '已重新排列！继续消除'
    setTimeout(() => { infoEl.textContent = '点击两个相同图标消除   路径不超过两个转角' }, 1500)
  }

  // ── 单元格坐标转换 ──

  function cellFromPixel(px, py) {
    if (py < HUD_H) return null
    const c = Math.floor(px / CELL_W)
    const r = Math.floor((py - HUD_H) / CELL_H)
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null
    return { r, c }
  }

  function cellCenter(r, c) {
    return {
      x: c * CELL_W + CELL_W / 2,
      y: HUD_H + r * CELL_H + CELL_H / 2,
    }
  }

  // ── 点击处理 ──

  function handleClick(px, py) {
    if (ended) return
    const cell = cellFromPixel(px, py)
    if (!cell) return
    const { r, c } = cell
    if (grid[r][c] === 0) return

    if (!selected) {
      selected = { r, c }
      return
    }

    if (selected.r === r && selected.c === c) {
      selected = null
      return
    }

    if (canMatch(selected.r, selected.c, r, c)) {
      const r1 = selected.r, c1 = selected.c
      grid[r1][c1] = 0
      grid[r][c]   = 0
      matched++
      flashPairs.push({ r1, c1, r2: r, c2: c, timer: 12 })
      selected = null

      if (matched >= TOTAL_PAIRS) {
        // 全部消除，胜利
        if (!endTimer) endTimer = setTimeout(doEnd, 900)
      } else if (!hasMove()) {
        reshuffle()
        // 重排后再检查
        if (!hasMove()) {
          // 极端情况：重排后依然无解（理论上不可能但防御处理）
          if (!endTimer) endTimer = setTimeout(doEnd, 800)
        }
      }
    } else {
      // 不可消除：换选
      selected = { r, c }
    }
  }

  // ── 绘制 ──

  function draw() {
    ctx.clearRect(0, 0, W, H)

    // 背景
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, W, H)

    // 网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath()
      ctx.moveTo(0, HUD_H + r * CELL_H)
      ctx.lineTo(W, HUD_H + r * CELL_H)
      ctx.stroke()
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath()
      ctx.moveTo(c * CELL_W, HUD_H)
      ctx.lineTo(c * CELL_W, H)
      ctx.stroke()
    }

    // 方块
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === 0) continue
        const cx = c * CELL_W, cy = HUD_H + r * CELL_H
        const isSel = selected && selected.r === r && selected.c === c

        // 背景方块
        ctx.fillStyle = isSel ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.07)'
        roundRect(ctx, cx + 3, cy + 3, CELL_W - 6, CELL_H - 6, 6)
        ctx.fill()

        if (isSel) {
          ctx.strokeStyle = '#60a5fa'
          ctx.lineWidth = 2
          roundRect(ctx, cx + 3, cy + 3, CELL_W - 6, CELL_H - 6, 6)
          ctx.stroke()
          ctx.lineWidth = 1
        }

        // 图标
        ctx.font = `${Math.min(CELL_W, CELL_H) * 0.5}px system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(TILES[grid[r][c] - 1], cx + CELL_W / 2, cy + CELL_H / 2)
      }
    }

    // 消除闪光
    flashPairs.forEach(fp => {
      if (fp.timer <= 0) return
      const alpha = fp.timer / 12
      ctx.globalAlpha = alpha * 0.6
      ctx.fillStyle = '#fde68a'
      const { x: x1, y: y1 } = cellCenter(fp.r1, fp.c1)
      const { x: x2, y: y2 } = cellCenter(fp.r2, fp.c2)
      ctx.beginPath(); ctx.arc(x1, y1, CELL_W * 0.4, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(x2, y2, CELL_W * 0.4, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    })

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, W, HUD_H)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const earn = Math.round(matched / TOTAL_PAIRS * 500)
    ctx.fillText(`已消除 ${matched} / ${TOTAL_PAIRS} 对`, 10, HUD_H / 2)
    ctx.textAlign = 'right'
    ctx.fillText(`预计 💰${earn}`, W - 8, HUD_H / 2)
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
    flashPairs.forEach(fp => fp.timer--)
    flashPairs = flashPairs.filter(fp => fp.timer > 0)
    draw()
    raf = requestAnimationFrame(loop)
  }

  // ── 结束 ──

  function doEnd() {
    if (ended) return
    ended = true
    cancelAnimationFrame(raf); raf = null
    if (endTimer) { clearTimeout(endTimer); endTimer = null }

    const earn = Math.round(matched / TOTAL_PAIRS * 500)
    if (player.monthStarted) applyChanges({ money: earn })

    setTimeout(() => {
      closeGame()
      if (player.monthStarted) showModal(`
        <div class="modal-title">💼 打工结束</div>
        <div style="font-size:36px;font-weight:800;text-align:center;margin:10px 0">${earn}<span style="font-size:14px;font-weight:500;color:var(--text-muted)"> 元</span></div>
        <div style="text-align:center;margin-bottom:10px;color:var(--text-muted);font-size:13px">消除了 ${matched} / ${TOTAL_PAIRS} 对</div>
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
        if (endTimer) { clearTimeout(endTimer); endTimer = null }
      }
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchend', onTouch)
      controls.style.display = ''
    }
  }

  // ── 启动 ──
  initGrid()
  if (!hasMove()) reshuffle()
  raf = requestAnimationFrame(loop)
}
