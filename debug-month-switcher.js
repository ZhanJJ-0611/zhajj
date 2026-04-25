/* ============================================================
   Debug Month Switcher
   Delete this file and its script tag in index.html for release builds.
   ============================================================ */

;(function () {
  const DEBUG_MONTH_SWITCHER_ENABLED = true
  const STYLE_ID = 'debug-month-switcher-style'
  const PANEL_ID = 'debug-month-switcher-panel'

  if (!DEBUG_MONTH_SWITCHER_ENABLED) return

  function ensureDebugMonthSwitcherStyles() {
    if (document.getElementById(STYLE_ID)) return

    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      .debug-month-card {
        border: 1px dashed #d4b36a;
        background: linear-gradient(135deg, rgba(255, 248, 220, 0.92), rgba(255, 243, 205, 0.96));
      }

      .debug-month-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
      }

      .debug-month-badge {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.6px;
        color: #9a6a00;
        background: rgba(255, 255, 255, 0.65);
        border: 1px solid rgba(212, 179, 106, 0.75);
        border-radius: 999px;
        padding: 3px 8px;
      }

      .debug-month-desc {
        font-size: 12px;
        color: #7b6b55;
        line-height: 1.7;
        margin-bottom: 12px;
      }

      .debug-month-system {
        border: 1px solid #d9cba8;
        border-radius: 14px;
        background: #fffdf7;
        padding: 14px;
      }

      .debug-month-label {
        display: block;
        font-size: 12px;
        font-weight: 700;
        color: #7a6340;
        margin-bottom: 6px;
      }

      .debug-month-select {
        width: 100%;
        height: 42px;
        border: 1px solid #d6c7a3;
        border-radius: 12px;
        padding: 0 12px;
        background: #fff;
        color: var(--text);
        font-size: 14px;
        font-family: inherit;
        outline: none;
      }

      .debug-month-select:focus {
        border-color: #c9952a;
        box-shadow: 0 0 0 3px rgba(201, 149, 42, 0.14);
      }

      .debug-month-current {
        margin-top: 8px;
        font-size: 12px;
        color: #8a7a65;
      }
    `
    document.head.appendChild(style)
  }

  function getMonthOptionsHtml() {
    return Array.from({ length: TOTAL_MONTHS }, (_, index) => {
      const month = index + 1
      const info = getMonthInfo(month)
      const selected = player.month === month ? ' selected' : ''
      return `<option value="${month}"${selected}>第 ${month} 轮 · ${info.grade} ${info.month}月</option>`
    }).join('')
  }

  function renderDebugMonthSwitcherCard() {
    return `
      <div class="card debug-month-card" id="${PANEL_ID}">
        <div class="debug-month-head">
          <div class="card-label" style="margin-bottom:0">调试功能</div>
          <span class="debug-month-badge">DEBUG</span>
        </div>
        <div class="debug-month-desc">
          立刻切换当前轮次，用于快速测试不同月份的流程与事件。
        </div>
        <button class="btn full-width" onclick="openDebugMonthSwitcher()">
          切换当前轮次
        </button>
      </div>
    `
  }

  function injectDebugMonthSwitcher() {
    if (currentPage !== 'home') return

    ensureDebugMonthSwitcherStyles()

    const content = document.getElementById('content')
    if (!content || document.getElementById(PANEL_ID)) return

    content.insertAdjacentHTML('beforeend', renderDebugMonthSwitcherCard())
  }

  function clearTransientGameFlows() {
    currentQuiz = null
    currentExam = null
    currentGaokao = null
    currentOlympiad = null
    currentEsportsExam = null
    _placementActive = false
  }

  function applyDebugMonthSwitch(targetMonth) {
    const month = Number(targetMonth)
    if (!Number.isInteger(month) || month < 1 || month > TOTAL_MONTHS) return

    clearTransientGameFlows()

    player.month = month
    player.monthStarted = false
    player.currentEvent = null
    player.currentChoiceEvent = null
    player.choiceEventDone = false
    player.choiceEventChosen = null
    player.eventShown = true
    player.studyCount = 0
    player.usedInteractions = []
    player.usedActivities = []
    player.usedSubjects = []

    autoStartMonth()
    saveState()
    renderStatusBar()
    renderEnergyBar()
    closeModal()
    renderHome()
  }

  window.openDebugMonthSwitcher = function () {
    ensureDebugMonthSwitcherStyles()

    const info = getMonthInfo(player.month)
    showModal(`
      <div class="modal-title">调试切换轮次</div>
      <div class="debug-month-system">
        <label class="debug-month-label" for="debug-month-select">目标轮次</label>
        <select id="debug-month-select" class="debug-month-select">
          ${getMonthOptionsHtml()}
        </select>
        <div class="debug-month-current">当前处于：第 ${player.month} 轮 · ${info.grade} ${info.month}月</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn full-width" onclick="closeModal()">取消</button>
        <button class="btn btn-primary full-width" onclick="confirmDebugMonthSwitch()">立即切换</button>
      </div>
    `, null, true)
  }

  window.confirmDebugMonthSwitch = function () {
    const select = document.getElementById('debug-month-select')
    if (!select) return
    applyDebugMonthSwitch(select.value)
  }

  if (typeof renderHome === 'function') {
    const originalRenderHome = renderHome
    renderHome = function () {
      originalRenderHome()
      injectDebugMonthSwitcher()
    }
  }
})()
