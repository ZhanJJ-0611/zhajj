/* ============================================================
   Monthly Flow
   ============================================================ */

// 鈹€鈹€鈹€ 鏈堝害浜嬩欢寮圭獥閾?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function showStudyEventPopup(callback) {
  const m = player.month
  let title, text, effect

  if (m >= 19) {
    title = '????'
    text = '???????????????????????????????????'
    effect = { health: -5, mental: -5 }
  } else if (m >= 15) {
    title = '????'
    text = '??????????????????????????'
    effect = { learning: -10 }
  } else {
    title = '?????'
    text = '????????????????????????????????'
    effect = { learning: -30 }
  }

  applyChanges(effect)
  saveState()

  const effectTagsHtml = Object.entries(effect).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
  }).join('')

  showModal(`
    <div class="modal-title">${title}</div>
    <div class="event-box" style="margin-bottom:10px">${text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `, callback)
}

function showMonthlyEventPopups(callback) {
  player.eventShown = true
  saveState()
  showStudyEventPopup(() => {
    const ev = player.currentEvent
    const afterEvents = () => {
      if (player.month === 13 && canTriggerOlympiadEvent()) {
        showOlympiadPrompt(callback)
      } else if (player.month === 13 && canTriggerEsportsEvent()) {
        showEsportsPrompt(callback)
      } else if (player.month === 9 && !player.profExamDone && player.selectedSubjects) {
        showProfExamIntroPopup()
      } else {
        callback()
        if (player.month === 1 && !player.tutorialDone) {
          setTimeout(startTutorial, 200)
        }
      }
    }
    if (!ev) { afterEvents(); return }
    showRandomEventPopup(() => {
      if (player.currentChoiceEvent && !player.choiceEventDone) {
        showChoiceEventPopup(afterEvents)
      } else {
        afterEvents()
      }
    })
  })
}

function getLastExamScore() {
  if (!Array.isArray(player.examHistory) || player.examHistory.length === 0) return null
  return player.examHistory[player.examHistory.length - 1]?.score ?? null
}

function getActivityCount(activityKey) {
  return player.activityCounts?.[activityKey] ?? 0
}

function canTriggerOlympiadEvent() {
  const lastExamScore = getLastExamScore()
  return player.month === 13
    && hasTag('smart')
    && !player.olympiadDone
    && lastExamScore !== null
    && lastExamScore > 600
}

function canTriggerEsportsEvent() {
  return player.month === 13
    && hasTag('free')
    && !player.esportsDone
    && getActivityCount('skyfight') >= 3
}

function showRandomEventPopup(callback) {
  const ev   = player.currentEvent
  const info = getMonthInfo(player.month)
  const effectTagsHtml = Object.entries(ev.effect || {}).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
  }).join('')
  showModal(`
    <div class="modal-title">?? ${info.grade} ${info.month}? ? ????</div>
    ${ev.name ? `<div class="event-name-tag">?${ev.name}?</div>` : ''}
    <div class="event-box" style="margin-bottom:10px">${ev.text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `, callback)
}

function showChoiceEventPopup(callback) {
  const ev = player.currentChoiceEvent
  _choicePopupCb = callback
  const btnsHtml = ev.choices.map((c, i) =>
    `<button class="choice-btn" onclick="handleChoicePopup(${i})">${c.label}</button>`
  ).join('')
  showModal(`
    <div class="modal-title">? ????</div>
    <div class="choice-event-text">${ev.text}</div>
    <div class="choice-btns">${btnsHtml}</div>
  `, null, true, true)
}

function handleChoicePopup(index) {
  const ev = player.currentChoiceEvent
  if (!ev) return
  const choice = ev.choices[index]
  player.choiceEventDone  = true
  player.choiceEventChosen = index
  saveState()
  applyChanges(choice.effect)

  const effectRows = Object.entries(choice.effect).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<div class="modal-row"><span>${label}</span><span class="${v >= 0 ? 'chg-pos' : 'chg-neg'}">${v >= 0 ? '+' : ''}${v}</span></div>`
  }).join('')

  const cb = _choicePopupCb; _choicePopupCb = null
  document.getElementById('modal-overlay').classList.add('hidden')
  _modalNoDismiss = false
  _modalCb = null

  showModal(`
    <div class="modal-title">? ?????${choice.label}</div>
    <div class="choice-result-box" style="margin-bottom:12px">${choice.desc}</div>
    <hr class="modal-divider">
    ${effectRows}
  `, cb)
}

// 鈹€鈹€鈹€ 浼氳€冨己鍒跺脊绐?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function showProfExamIntroPopup() {
  if (!player.selectedSubjects) return
  const subjects = ELECTIVE_SUBJECTS.filter(s => !player.selectedSubjects.includes(s))
  showModal(`
    <div class="modal-title">?? ????</div>
    <div class="event-box" style="margin-bottom:12px">
      ??????????????????????????????
      ???????????????????
    </div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">
      ?????${subjects.join(' ? ')}
    </div>
  `, () => {
    startProficiencyExam()
  }, false, true)
}

// 鈹€鈹€鈹€ 鍒嗙浜嬩欢 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function showSubjectSelection(callback) {
  _subjectSelCb      = callback
  _subjectSelPending = []
  renderSubjectSelModal()
}

function renderSubjectSelModal() {
  const sel = _subjectSelPending
  const btnsHtml = ELECTIVE_SUBJECTS.map(s =>
    `<button class="subject-sel-btn ${sel.includes(s) ? 'active' : ''}" onclick="toggleSubjectSel('${s}')">${s}</button>`
  ).join('')
  const canConfirm = sel.length === 3
  showModal(`
    <div class="modal-title">?? ????</div>
    <div class="event-box" style="margin-bottom:14px">
      ?????????????????? <strong>??</strong>?<br>
      <span style="font-size:12px;color:var(--text-muted)">????????????????????????</span>
    </div>
    <div class="subject-sel-grid">${btnsHtml}</div>
    <div style="text-align:center;font-size:12px;color:var(--text-muted);margin:8px 0">
      ??? ${sel.length} / 3 ?
    </div>
    <button class="btn btn-primary full-width" ${canConfirm ? '' : 'disabled'} onclick="confirmSubjectSel()">
      ${canConfirm ? '????' : '?????'}
    </button>
  `, null, true, true)
}

function toggleSubjectSel(subject) {
  const idx = _subjectSelPending.indexOf(subject)
  if (idx >= 0) {
    _subjectSelPending.splice(idx, 1)
  } else if (_subjectSelPending.length < 3) {
    _subjectSelPending.push(subject)
  }
  renderSubjectSelModal()
}

function confirmSubjectSel() {
  if (_subjectSelPending.length !== 3) return
  player.selectedSubjects = [...CORE_SUBJECTS, ..._subjectSelPending]
  sanitizeBiasTrackingState()
  filterTeachersForSubjects()
  saveState()
  document.getElementById('modal-overlay').classList.add('hidden')
  _modalNoDismiss = false; _modalCb = null
  const cb = _subjectSelCb; _subjectSelCb = null
  cb?.()
}

function applyAffinityEffect(ae) {
  if (!ae) return
  const all = [...relations.teachers, ...relations.classmates]
  if (ae.id) {
    const p = all.find(x => x.id === ae.id)
    if (p) p.affinity = clamp(p.affinity + ae.delta)
  } else if (ae.group === 'teachers') {
    relations.teachers.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
  } else if (ae.group === 'classmates') {
    relations.classmates.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
  } else if (ae.group === 'all') {
    all.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
  }
  saveState()
}

// 鈹€鈹€鈹€ 鑷姩寮€鏈?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function getMonthlyEventPools() {
  return player.month >= 15 ? MONTHLY_EVENT_POOLS.high3 : MONTHLY_EVENT_POOLS.high1_2
}

function getMonthlyEventDrawHistory() {
  return Array.isArray(player.eventDrawHistory) ? player.eventDrawHistory : []
}

function getDrawnMonthlyEventIds() {
  return Array.isArray(player.drawnMonthlyEventIds) ? player.drawnMonthlyEventIds : []
}

function getDrawnChoiceEventIds() {
  return Array.isArray(player.drawnChoiceEventIds) ? player.drawnChoiceEventIds : []
}

function getChoiceEventId(event, index = -1) {
  return event?.id ?? `choice-event-${index}`
}

function isHolidayEventMonth(month = player.month) {
  const info = getMonthInfo(month)
  return (info.grade === '高一' || info.grade === '高二')
    && (info.month === 2 || info.month === 7)
}

function getChoiceEventPool() {
  return isHolidayEventMonth() ? HOLIDAY_CHOICE_EVENTS : CHOICE_EVENTS
}

function chooseMonthlyEventTone(pools, availablePools) {
  const history = getMonthlyEventDrawHistory()
  const recentTones = history.slice(-2).map(item => item.tone).filter(Boolean)

  if (recentTones.length === 2 && recentTones[0] === recentTones[1]) {
    const forcedTone = recentTones[0] === 'lucky' ? 'unlucky' : 'lucky'
    if ((availablePools[forcedTone] || []).length > 0) return forcedTone
  }

  if (!(availablePools.lucky || []).length) return 'unlucky'
  if (!(availablePools.unlucky || []).length) return 'lucky'

  let luckyWeight = 0.5

  if (hasTag('charming')) luckyWeight += 0.15
  if (hasTag('awkward')) luckyWeight -= 0.15

  const lastTone = history[history.length - 1]?.tone
  if (lastTone === 'lucky') luckyWeight -= 0.18
  if (lastTone === 'unlucky') luckyWeight += 0.18

  luckyWeight = Math.max(0.25, Math.min(0.75, luckyWeight))
  return Math.random() < luckyWeight ? 'lucky' : 'unlucky'
}

function pickEventFromTonePool(pool, excludedIds = []) {
  if (!pool || pool.length === 0) return null
  const filtered = pool.filter(event => !excludedIds.includes(event.id))
  if (filtered.length === 0) return null
  return filtered[rndInt(filtered.length)]
}

function rememberMonthlyEventDraw(event, tone) {
  const nextHistory = [...getMonthlyEventDrawHistory(), { id: event.id, tone }]
  player.eventDrawHistory = nextHistory.slice(-6)
  player.drawnMonthlyEventIds = [...getDrawnMonthlyEventIds(), event.id]
}

function pickMonthlyEvent() {
  if (isHolidayEventMonth()) {
    const drawnIds = new Set(getDrawnMonthlyEventIds())
    const history = getMonthlyEventDrawHistory()
    const recentIds = history.slice(-3).map(item => item.id)
    const holidayPool = (HOLIDAY_RANDOM_EVENTS || []).filter(event => !drawnIds.has(event.id))

    const picked = pickEventFromTonePool(holidayPool, recentIds)
      || pickEventFromTonePool(holidayPool)

    if (!picked) return null

    rememberMonthlyEventDraw(picked, 'holiday')
    return { ...picked, tone: 'holiday' }
  }

  const pools = getMonthlyEventPools()
  const drawnIds = new Set(getDrawnMonthlyEventIds())
  const availablePools = {
    lucky: (pools.lucky || []).filter(event => !drawnIds.has(event.id)),
    unlucky: (pools.unlucky || []).filter(event => !drawnIds.has(event.id)),
  }
  const history = getMonthlyEventDrawHistory()
  const recentIds = history.slice(-3).map(item => item.id)
  const preferredTone = chooseMonthlyEventTone(pools, availablePools)
  const toneOrder = preferredTone === 'lucky'
    ? ['lucky', 'unlucky']
    : ['unlucky', 'lucky']

  for (const tone of toneOrder) {
    const picked = pickEventFromTonePool(availablePools[tone], recentIds)
    if (picked) {
      rememberMonthlyEventDraw(picked, tone)
      return { ...picked, tone }
    }
  }

  const fallbackPool = [...availablePools.lucky, ...availablePools.unlucky]
  if (fallbackPool.length === 0) return null

  const picked = fallbackPool[rndInt(fallbackPool.length)]
  const tone = availablePools.lucky.some(event => event.id === picked.id) ? 'lucky' : 'unlucky'
  rememberMonthlyEventDraw(picked, tone)
  return { ...picked, tone }
}

function pickChoiceEvent() {
  const eventPool = getChoiceEventPool()
  const drawnIds = new Set(getDrawnChoiceEventIds())
  const availableEvents = eventPool
    .map((event, index) => ({ event, index, id: getChoiceEventId(event, index) }))
    .filter(item => !drawnIds.has(item.id))

  if (availableEvents.length === 0) return null

  const picked = availableEvents[rndInt(availableEvents.length)]
  player.drawnChoiceEventIds = [...getDrawnChoiceEventIds(), picked.id]
  return picked.event
}

function autoStartMonth() {
  if (!player.currentEvent) {
    player.currentEvent = pickMonthlyEvent()
  }
  if (!player.currentChoiceEvent) {
    player.currentChoiceEvent = pickChoiceEvent()
    player.choiceEventDone = false
    player.choiceEventChosen = null
  }
  player.monthStarted = true
  player.studyCount = 0
  player.energy = player.maxEnergy ?? 4   // 鍏堥噸缃簿鍔涳紝鍐嶅簲鐢ㄤ簨浠舵晥鏋滐紙浜嬩欢鍙兘鎵ｇ簿鍔涳級
  player.usedInteractions = []
  player.usedActivities = []
  player.usedSubjects = []

  if (player.currentEvent?.effect) applyChanges(player.currentEvent.effect)
  if (player.currentEvent?.affinityEffect) applyAffinityEffect(player.currentEvent.affinityEffect)

  // 绮惧姏绫绘爣绛撅紙鍦ㄤ簨浠跺簲鐢ㄥ悗鍐嶈皟鏁达級
  if (hasTag('motor') && Math.random() < 0.3) {
    player.energy = Math.min(player.maxEnergy ?? 4, player.energy + 1)
  }
  if (hasTag('sloth') && Math.random() < 0.3) {
    player.energy = Math.max(0, player.energy - 1)
    player.mental = Math.min(100, (player.mental || 0) + 5)
    player.health = Math.min(100, (player.health || 0) + 5)
  }

  // 瀹跺涵绫绘爣绛?
  if (hasTag('kpi'))   player.mental = Math.max(0, (player.mental || 0) - 10)
  if (hasTag('press')) { player.mental = Math.max(0, (player.mental || 0) - 10); player.health = Math.max(0, (player.health || 0) - 10) }

  player.eventShown = false
  saveState()
  renderStatusBar()
  renderEnergyBar()
}

function markActivityUsed(key) {
  if (!player.usedActivities) player.usedActivities = []
  if (!player.usedActivities.includes(key)) {
    player.usedActivities.push(key)
    player.activityCounts = player.activityCounts || {}
    player.activityCounts[key] = (player.activityCounts[key] || 0) + 1
    saveState()
  }
}

function ensureCategoryEnergySpent() {
  const spent = player.categoryEnergySpent || {}
  player.categoryEnergySpent = {
    social: Number.isFinite(spent.social) ? spent.social : 0,
    study: Number.isFinite(spent.study) ? spent.study : 0,
    activity: Number.isFinite(spent.activity) ? spent.activity : 0,
  }
  return player.categoryEnergySpent
}

function recordCategoryEnergySpend(category, amount = 1) {
  if (!category || amount <= 0) return
  const spent = ensureCategoryEnergySpent()
  if (!(category in spent)) return
  spent[category] += amount
  saveState()
}

function getDominantJourneyCategory() {
  const spent = ensureCategoryEnergySpent()
  const order = ['study', 'social', 'activity']
  let best = order[0]

  order.forEach(category => {
    if ((spent[category] || 0) > (spent[best] || 0)) {
      best = category
    }
  })

  return best
}

// 鈹€鈹€鈹€ 鐘舵€佹爮 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function renderStatusBar() {
  const keys = ['health', 'mental', 'effort', 'learning']
  keys.forEach(k => {
    const v = clamp(player[k])
    const ring = document.getElementById(`ring-${k}`)
    if (ring) ring.style.strokeDasharray = `${v} 100`
    const num = document.getElementById(`num-${k}`)
    if (num) num.textContent = v
  })
}

function renderEnergyBar() {
  const max = player.maxEnergy ?? 4
  const cur = Math.max(0, player.energy ?? max)
  const dotsEl = document.getElementById('energy-dots')
  const countEl = document.getElementById('energy-count')
  if (!dotsEl) return
  dotsEl.innerHTML = Array.from({ length: max }, (_, i) =>
    `<div class="energy-dot ${i < cur ? 'full' : 'empty'}"></div>`
  ).join('')
  if (countEl) countEl.textContent = `${cur} / ${max}`
  const moneyEl = document.getElementById('money-display')
  if (moneyEl) moneyEl.textContent = player.money ?? 0
}

function useEnergy() {
  const cur = player.energy ?? 0
  if (cur <= 0) {
    showModal('<div class="modal-title">绮惧姏鑰楀敖</div><p class="muted tc" style="padding:4px 0 8px">浠婂ぉ鐨勭簿鍔涘凡缁忕敤瀹屼簡锛?br>浼戞伅涓€涓嬬瓑寰呬笅涓湀鍚с€?/p>')
    return false
  }
  player.energy = cur - 1
  saveState()
  renderEnergyBar()
  return true
}

function getTrackedStudySubjects() {
  return Array.isArray(player.selectedSubjects) && player.selectedSubjects.length > 0
    ? player.selectedSubjects
    : SUBJECTS
}

function sanitizeBiasTrackingState() {
  const trackedSubjects = new Set(getTrackedStudySubjects())
  const history = Array.isArray(player.subjectHistory) ? player.subjectHistory : []
  const nextHistory = history.filter(subject => trackedSubjects.has(subject)).slice(-11)
  const historyChanged = history.length !== nextHistory.length
    || nextHistory.some((subject, index) => subject !== history[index])

  player.subjectHistory = nextHistory

  if (player.pendingBias && !trackedSubjects.has(player.pendingBias.subject)) {
    player.pendingBias = null
    return true
  }

  return historyChanged
}

function updateSubjectHistory(subject) {
  const trackedSubjects = getTrackedStudySubjects()
  if (!trackedSubjects.includes(subject)) return

  sanitizeBiasTrackingState()
  if (!player.subjectHistory) player.subjectHistory = []
  player.subjectHistory.push(subject)
  if (player.subjectHistory.length > 11) player.subjectHistory.shift()
  if (player.pendingBias) { saveState(); return }

  const hist = player.subjectHistory

  // 杩炵画涓夋鍒峰悓涓€绉戠洰
  if (hist.length >= 3) {
    const tail = hist.slice(-3)
    if (tail.every(s => s === tail[0])) {
      player.pendingBias = {
        type: 'streak', subject: tail[0],
        message: `????????? ${tail[0]}????????????????????`,
      }
      saveState(); return
    }
  }

  // 杩炵画鍗佹鏈埛鏌愪竴绉戠洰锛堣绉戠洰鏇捐鍒疯繃锛?
  if (hist.length >= 11) {
    const last10 = hist.slice(-10)
    const neglected = trackedSubjects.filter(s => hist.includes(s) && !last10.includes(s))
    if (neglected.length > 0) {
      player.pendingBias = {
        type: 'neglect', subject: neglected[0],
        message: `????? 10 ???? ${neglected[0]}??????????????????`,
      }
    }
  }
  saveState()
}

function getBiasWarnings() {
  if (sanitizeBiasTrackingState()) saveState()
  const hist = player.subjectHistory || []
  if (player.pendingBias) return []
  const warnings = []
  const trackedSubjects = getTrackedStudySubjects()

  // 鍗冲皢杩炵画涓夋锛堝綋鍓嶈繛缁袱娆★級
  if (hist.length >= 2 && hist[hist.length - 1] === hist[hist.length - 2]) {
    warnings.push(`鈿狅笍 宸茶繛缁?2 娆″埛 ${hist[hist.length - 1]}锛屽啀鍒峰悓涓€绉戝皢瑙﹀彂鍋忕鎯╃綒`)
  }

  // 鍗冲皢杩炵画鍗佹鏈埛锛堝綋鍓嶈繛缁節娆℃湭鍒凤級
  if (hist.length >= 10) {
    const last9 = hist.slice(-9)
    trackedSubjects.filter(s => hist.includes(s) && !last9.includes(s)).slice(0, 2).forEach(s => {
      warnings.push(`鈿狅笍 ${s} 宸茶繛缁?9 娆℃湭鍒凤紝鍐嶄笉鍒峰皢瑙﹀彂鍋忕鎯╃綒`)
    })
  }

  return warnings
}

// 鈹€鈹€鈹€ 灏忔父鎴忛娆″紩瀵?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function showGameTutorial(key, callback) {
  const tut = GAME_TUTORIALS[key]
  if (!tut) { callback(); return }
  const seen = player.seenGameTutorials || []
  if (seen.includes(key)) { callback(); return }
  player.seenGameTutorials = [...seen, key]
  saveState()
  showModal(`
    <div class="modal-title">${tut.title}</div>
    <div class="event-box" style="font-size:13px;line-height:1.8;margin-bottom:14px;white-space:pre-line">${tut.desc}</div>
    <button class="btn btn-primary full-width" onclick="closeModal()">鏄庣櫧浜嗭紝寮€濮嬶紒</button>
  `, callback, true)
}

function applyChanges(changes) {
  Object.entries(changes).forEach(([k, d]) => {
    if (k === 'money') {
      player.money = Math.round((player.money || 0) + d)
    } else if (k === 'energy') {
      player.energy = Math.max(0, Math.min(player.maxEnergy ?? 4, Math.round((player.energy || 0) + d)))
    } else if (k in player) {
      player[k] = clamp(player[k] + d)
    }
  })
  renderStatusBar()
  renderEnergyBar()
  saveState()
}

function showStudyEventPopup(callback) {
  const m = player.month
  let title
  let text
  let effect

  if (m >= 19) {
    title = '高考冲刺'
    text = '临近高考，作息越来越紧，身体和心理都承受着更大的压力。'
    effect = { health: -5, mental: -5 }
  } else if (m >= 15) {
    title = '高三复习'
    text = '高三的复习节奏明显加快，知识点多、练习密，学习状态有所波动。'
    effect = { learning: -10 }
  } else {
    title = '日常学习'
    text = '高中课程逐渐加深，新的内容不断增加，想完全跟上并不轻松。'
    effect = { learning: -30 }
  }

  applyChanges(effect)
  saveState()

  const effectTagsHtml = Object.entries(effect).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
  }).join('')

  showModal(`
    <div class="modal-title">${title}</div>
    <div class="event-box" style="margin-bottom:10px">${text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `, callback)
}

function showRandomEventPopup(callback) {
  const ev = player.currentEvent
  const info = getMonthInfo(player.month)
  const effectTagsHtml = Object.entries(ev.effect || {}).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<span class="effect-tag ${v > 0 ? 'effect-tag-pos' : 'effect-tag-neg'}">${label} ${v > 0 ? '+' : ''}${v}</span>`
  }).join('')

  showModal(`
    <div class="modal-title">${info.grade} ${info.month}月 · 随机事件</div>
    ${ev.name ? `<div class="event-name-tag">${ev.name}</div>` : ''}
    <div class="event-box" style="margin-bottom:10px">${ev.text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `, callback)
}

function showChoiceEventPopup(callback) {
  const ev = player.currentChoiceEvent
  _choicePopupCb = callback
  const btnsHtml = ev.choices.map((c, i) =>
    `<button class="choice-btn" onclick="handleChoicePopup(${i})">${c.label}</button>`
  ).join('')

  showModal(`
    <div class="modal-title">选择事件</div>
    <div class="choice-event-text">${ev.text}</div>
    <div class="choice-btns">${btnsHtml}</div>
  `, null, true, true)
}

function handleChoicePopup(index) {
  const ev = player.currentChoiceEvent
  if (!ev) return
  const choice = ev.choices[index]
  player.choiceEventDone = true
  player.choiceEventChosen = index
  saveState()
  applyChanges(choice.effect)

  const effectRows = Object.entries(choice.effect).map(([k, v]) => {
    const label = STAT_LABELS[k] ?? k
    return `<div class="modal-row"><span>${label}</span><span class="${v >= 0 ? 'chg-pos' : 'chg-neg'}">${v >= 0 ? '+' : ''}${v}</span></div>`
  }).join('')

  const cb = _choicePopupCb
  _choicePopupCb = null
  document.getElementById('modal-overlay').classList.add('hidden')
  _modalNoDismiss = false
  _modalCb = null

  showModal(`
    <div class="modal-title">你选择了：${choice.label}</div>
    <div class="choice-result-box" style="margin-bottom:12px">${choice.desc}</div>
    <hr class="modal-divider">
    ${effectRows}
  `, cb)
}

function showProfExamIntroPopup() {
  if (!player.selectedSubjects) return
  const subjects = ELECTIVE_SUBJECTS.filter(s => !player.selectedSubjects.includes(s))
  showModal(`
    <div class="modal-title">学业水平考试</div>
    <div class="event-box" style="margin-bottom:12px">
      本月将进行学业水平考试。
      你没有选择的科目会在这次考试中统一结算成绩。
    </div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">
      本次考试科目：${subjects.join('、')}
    </div>
  `, () => {
    startProficiencyExam()
  }, false, true)
}

function showGaokaoRegistrationIntro(callback) {
  showModal(`
    <div class="modal-title">高考报名</div>
    <div class="event-box" style="margin-bottom:12px;line-height:1.8">
      高三进入关键阶段，学校开始统一组织高考报名。<br>
      请认真填写报名信息并设置好密码，这将作为后续查询和确认的重要凭证。
    </div>
  `, () => showGaokaoRegistrationForm(callback))
}

function showGaokaoRegistrationForm(callback) {
  const playerName = player.name || '未命名考生'
  showModal(`
    <div class="gaokao-reg-system">
      <div class="gaokao-reg-topbar">山河省普通高校招生考试报名系统</div>
      <div class="gaokao-reg-title">考生报名信息确认</div>

      <div class="gaokao-reg-field">
        <label class="gaokao-reg-label">姓名</label>
        <input id="gaokao-reg-name" class="gaokao-reg-input is-locked" type="text" value="${escapeHtml(playerName)}" disabled>
      </div>

      <div class="gaokao-reg-field">
        <label class="gaokao-reg-label">密码</label>
        <input id="gaokao-reg-password" class="gaokao-reg-input" type="password" maxlength="20" placeholder="请输入报名密码">
      </div>

      <div class="gaokao-reg-field">
        <label class="gaokao-reg-label">确认密码</label>
        <input id="gaokao-reg-confirm" class="gaokao-reg-input" type="password" maxlength="20" placeholder="请再次输入报名密码">
      </div>

      <div id="gaokao-reg-error" class="gaokao-reg-error"></div>

      <button class="btn btn-primary full-width gaokao-reg-submit" onclick="submitGaokaoRegistration()">确认报名</button>
    </div>
  `, callback, true, true)

  setTimeout(() => {
    document.getElementById('gaokao-reg-password')?.focus()
  }, 0)
}

function submitGaokaoRegistration() {
  const passwordInput = document.getElementById('gaokao-reg-password')
  const confirmInput = document.getElementById('gaokao-reg-confirm')
  const errorEl = document.getElementById('gaokao-reg-error')

  if (!passwordInput || !confirmInput || !errorEl) return

  const password = passwordInput.value
  const confirmPassword = confirmInput.value

  if (!password.trim()) {
    errorEl.textContent = '请输入报名密码。'
    passwordInput.focus()
    return
  }

  if (password !== confirmPassword) {
    errorEl.textContent = '两次输入的密码不一致，请重新确认。'
    confirmInput.focus()
    confirmInput.select()
    return
  }

  player.gaokaoRegistrationDone = true
  player.gaokaoRegistrationPassword = password
  saveState()
  closeModal()
}

function renderSubjectSelModal() {
  const sel = _subjectSelPending
  const btnsHtml = ELECTIVE_SUBJECTS.map(s =>
    `<button class="subject-sel-btn ${sel.includes(s) ? 'active' : ''}" onclick="toggleSubjectSel('${s}')">${s}</button>`
  ).join('')
  const canConfirm = sel.length === 3

  showModal(`
    <div class="modal-title">选择分科</div>
    <div class="event-box" style="margin-bottom:14px">
      请从以下科目中选择 <strong>3 门</strong> 作为你的选考科目。<br>
      <span style="font-size:12px;color:var(--text-muted)">选择完成后，将按这些科目进入后续学习与考试。</span>
    </div>
    <div class="subject-sel-grid">${btnsHtml}</div>
    <div style="text-align:center;font-size:12px;color:var(--text-muted);margin:8px 0">
      已选择 ${sel.length} / 3 门
    </div>
    <button class="btn btn-primary full-width" ${canConfirm ? '' : 'disabled'} onclick="confirmSubjectSel()">
      ${canConfirm ? '确认分科' : '请选择 3 门'}
    </button>
  `, null, true, true)
}

function useEnergy(category = '') {
  const cur = player.energy ?? 0
  if (cur <= 0) {
    showModal('<div class="modal-title">精力耗尽</div><p class="muted tc" style="padding:4px 0 8px">这个月的精力已经用完了。<br>等下个月再继续安排吧。</p>')
    return false
  }
  player.energy = cur - 1
  saveState()
  recordCategoryEnergySpend(category)
  renderEnergyBar()
  return true
}

function updateSubjectHistory(subject) {
  const trackedSubjects = getTrackedStudySubjects()
  if (!trackedSubjects.includes(subject)) return

  sanitizeBiasTrackingState()
  if (!player.subjectHistory) player.subjectHistory = []
  player.subjectHistory.push(subject)
  if (player.subjectHistory.length > 11) player.subjectHistory.shift()
  if (player.pendingBias) { saveState(); return }

  const hist = player.subjectHistory

  if (hist.length >= 3) {
    const tail = hist.slice(-3)
    if (tail.every(s => s === tail[0])) {
      player.pendingBias = {
        type: 'streak',
        subject: tail[0],
        message: `你已经连续 3 次刷 ${tail[0]} 了，继续偏科会影响整体成绩。`,
      }
      saveState()
      return
    }
  }

  if (hist.length >= 11) {
    const last10 = hist.slice(-10)
    const neglected = trackedSubjects.filter(s => hist.includes(s) && !last10.includes(s))
    if (neglected.length > 0) {
      player.pendingBias = {
        type: 'neglect',
        subject: neglected[0],
        message: `你已经连续 10 次没有刷 ${neglected[0]} 了，再这样下去会明显偏科。`,
      }
    }
  }
  saveState()
}

function getBiasWarnings() {
  if (sanitizeBiasTrackingState()) saveState()
  const hist = player.subjectHistory || []
  if (player.pendingBias) return []
  const warnings = []
  const trackedSubjects = getTrackedStudySubjects()

  if (hist.length >= 2 && hist[hist.length - 1] === hist[hist.length - 2]) {
    warnings.push(`⚠️ 你已经连续 2 次刷 ${hist[hist.length - 1]}，再刷一次就会触发偏科惩罚`)
  }

  if (hist.length >= 10) {
    const last9 = hist.slice(-9)
    trackedSubjects.filter(s => hist.includes(s) && !last9.includes(s)).slice(0, 2).forEach(s => {
      warnings.push(`⚠️ ${s} 已经连续 9 次没刷，再不补上就会触发偏科惩罚`)
    })
  }

  return warnings
}

function showGameTutorial(key, callback) {
  const tut = GAME_TUTORIALS[key]
  if (!tut) { callback(); return }
  const seen = player.seenGameTutorials || []
  if (seen.includes(key)) { callback(); return }
  player.seenGameTutorials = [...seen, key]
  saveState()
  showModal(`
    <div class="modal-title">${tut.title}</div>
    <div class="event-box" style="font-size:13px;line-height:1.8;margin-bottom:14px;white-space:pre-line">${tut.desc}</div>
    <button class="btn btn-primary full-width" onclick="closeModal()">明白了，开始</button>
  `, callback, true)
}

