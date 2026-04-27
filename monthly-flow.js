/* ============================================================
   Monthly Flow
   ============================================================ */

// ─── 月度事件弹窗链 ─────────────────────────────────────────

function showStudyEventPopup(callback) {
  const m = player.month
  let title, text, effect

  if (m >= 19) {
    title = '高考冲刺'
    text = '临近高考，作息越来越紧，身体和心理都承受着更大的压力。'
    effect = { health: -5, mental: -5 }
  } else if (m >= 15) {
    title = '高三复习'
    text = '高三的复习节奏明显加快，知识点多、练习密，学习状态有所波动。'
    effect = { learning: -20 }
  } else {
    title = '日常学习'
    text = '高中课程逐渐加深，新的内容不断增加，想完全跟上并不轻松。'
    effect = { learning: -20 }
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
  const continueWithNormalFlow = () => showStudyEventPopup(() => {
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

  if (player.pendingScumbagPunishment) {
    player.loverInteractionThisRound = false
    player.loverInteractionStreak = 0
    player.pendingLoverScandal = false
    player.loverNeglectStreak = 0
    player.pendingLoverNeglect = false
    showScumbagPunishmentEvent(continueWithNormalFlow)
    return
  }
  if (player.pendingLoverScandal) {
    showLoverScandalEvent(continueWithNormalFlow)
    return
  }
  if (player.pendingLoverNeglect) {
    showLoverNeglectEvent(continueWithNormalFlow)
    return
  }
  continueWithNormalFlow()
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
    <div class="modal-title">${info.grade} ${info.month}月 · 随机事件</div>
    ${ev.name ? `<div class="event-name-tag">${ev.name}</div>` : ''}
    <div class="event-box" style="margin-bottom:10px">${ev.text}</div>
    <div class="effect-tags">${effectTagsHtml}</div>
  `, callback)
}

function showScumbagPunishmentEvent(callback) {
  const formerLovers = getLoverClassmates()
  const formerNames = formerLovers
    .map(rel => CLASSMATE_POOL.find(c => c.id === rel.id)?.name)
    .filter(Boolean)

  relations.classmates.forEach(rel => {
    const wasLover = rel.lover
    rel.affinity = 20
    rel.bonded = false
    rel.lover = false
    rel.romanceEventDone = false
    rel.romanceDeclined = false
    if (wasLover) rel.interactionBlocked = true
  })

  player.pendingScumbagPunishment = false
  saveState()

  const blockedNamesHtml = formerNames.length
    ? `
      <div class="event-box" style="margin-top:10px;margin-bottom:10px">
        被你伤透心、从此不再理你的对象：${formerNames.join('、')}
      </div>
    `
    : ''

  showModal(`
    <div class="modal-title">渣人有恶报</div>
    <div class="event-box" style="margin-bottom:10px;line-height:1.8">
      你脚踏多条船的事终于彻底败露。<br>
      操场、走廊、班群、小卖部，八卦像长了腿一样瞬间传遍全年级。<br>
      昨天还在和你说悄悄话的人，今天已经统一把你列入“避雷名单”。
    </div>
    ${blockedNamesHtml}
    <hr class="modal-divider">
    <div class="modal-row"><span>所有同学好感度</span><span class="chg-neg">统一变为 20</span></div>
    <div class="modal-row"><span>恋人关系</span><span class="chg-neg">全部清空</span></div>
    <div class="modal-row"><span>前任互动权限</span><span class="chg-neg">永久关闭</span></div>
  `, callback)
}

function updateLoverInteractionStreakOnMonthStart() {
  if (player.pendingScumbagPunishment) {
    player.loverInteractionThisRound = false
    player.loverInteractionStreak = 0
    player.pendingLoverScandal = false
    player.loverNeglectStreak = 0
    player.pendingLoverNeglect = false
    return
  }

  const hadLoverInteraction = !!player.loverInteractionThisRound
  const hasCurrentLover = hasLoverClassmate()

  if (hadLoverInteraction && hasCurrentLover) {
    player.loverInteractionStreak = (player.loverInteractionStreak || 0) + 1
    player.loverNeglectStreak = 0
    if (player.loverInteractionStreak >= 3) {
      player.pendingLoverScandal = true
      player.loverScandalCount = (player.loverScandalCount || 0) + 1
      player.loverInteractionStreak = 0
    }
  } else if (!hadLoverInteraction && hasCurrentLover) {
    player.loverInteractionStreak = 0
    player.loverNeglectStreak = (player.loverNeglectStreak || 0) + 1
    if (player.loverNeglectStreak >= 3) {
      player.pendingLoverNeglect = true
      player.loverNeglectCount = (player.loverNeglectCount || 0) + 1
      player.loverNeglectStreak = 0
    }
  } else {
    player.loverInteractionStreak = 0
    player.loverNeglectStreak = 0
  }

  player.loverInteractionThisRound = false
}

function markClassmateAsEx(rel) {
  if (!rel) return
  rel.lover = false
  rel.exLover = true
  rel.bonded = false
  rel.affinity = 20
  rel.romanceDeclined = false
}

function expelPlayerForEarlyRomance(title, desc) {
  player.pendingLoverScandal = false
  player.loverInteractionThisRound = false
  player.loverInteractionStreak = 0
  player.loverNeglectStreak = 0
  player.pendingLoverNeglect = false
  player.monthStarted = false
  player.month = TOTAL_MONTHS + 1
  saveState()
  showGameOverModal(title, desc)
}

function showLoverScandalEvent(callback) {
  const loverNames = getLoverClassmates()
    .map(rel => CLASSMATE_POOL.find(c => c.id === rel.id)?.name)
    .filter(Boolean)
  const loverText = loverNames.length
    ? `班主任把你和${loverNames.join('、')}最近的互动看得一清二楚。`
    : '班主任已经察觉到你最近和某位同学的关系不太对劲。'

  player.pendingLoverScandal = false
  saveState()

  if ((player.loverScandalCount || 0) >= 2) {
    showModal(`
      <div class="modal-title">东窗事发</div>
      <div class="event-box" style="margin-bottom:12px;line-height:1.8">
        ${loverText}<br>
        上次谈话后的警告显然没有起作用。<br>
        班主任这次没有再留情面，直接把早恋情况上报学校。<br>
        很快，处分决定就下来了。
      </div>
    `, () => expelPlayerForEarlyRomance(
      '开除退学',
      '你在被明确警告后再次因早恋被抓，学校最终作出开除退学处理。你的高中生活就此戛然而止。'
    ))
    return
  }

  window._loverScandalFight = () => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    expelPlayerForEarlyRomance(
      '开除退学',
      '面对班主任的谈话，你选择了高调抗争。学校认定你态度恶劣，最终作出开除退学处理。'
    )
  }

  window._loverScandalEvade = () => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    showModal(`
      <div class="modal-title">老师忠告</div>
      <div class="event-box" style="margin-bottom:12px;line-height:1.8">
        你低下头，含糊地把这次谈话应付了过去。<br>
        班主任盯着你看了很久，最后只留下一句：<br>
        “这次我当你年轻不懂事，但如果再让我发现一次，处分绝不会只是谈话。”<br>
        你勉强点头，把这次风波先混了过去。
      </div>
    `, callback)
  }

  showModal(`
    <div class="modal-title">东窗事发</div>
    <div class="event-box" style="margin-bottom:14px;line-height:1.8">
      ${loverText}<br>
      连续几个月的异常互动终于引起了班主任的注意。<br>
      这天下午，你被单独叫到了办公室。老师语气严肃，明确指出你正在早恋，并要求你立刻表态。
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn full-width" onclick="_loverScandalFight()">高调抗争</button>
      <button class="btn btn-primary full-width" onclick="_loverScandalEvade()">含糊应付</button>
    </div>
  `, null, true, true)
}

function showLoverNeglectEvent(callback) {
  const loverRel = getLoverClassmates()[0] || null
  const loverName = loverRel ? (CLASSMATE_POOL.find(c => c.id === loverRel.id)?.name || '恋人') : '恋人'

  player.pendingLoverNeglect = false
  player.loverInteractionThisRound = false
  player.loverInteractionStreak = 0
  player.loverNeglectStreak = 0
  saveState()

  if (!loverRel) {
    callback()
    return
  }

  if ((player.loverNeglectCount || 0) >= 2) {
    markClassmateAsEx(loverRel)
    saveState()
    showModal(`
      <div class="modal-title">喜新厌旧</div>
      <div class="event-box" style="margin-bottom:12px;line-height:1.8">
        你已经连续很久没有主动去见 ${loverName}。<br>
        上次挽回后的承诺也没能兑现。<br>
        这一次，对方没有再给你解释的机会，只是很平静地说：<br>
        “到这里吧，我不想再一个人等了。” 
      </div>
      <hr class="modal-divider">
      <div class="modal-row"><span>${loverName} 的关系状态</span><span class="chg-neg">变为前任</span></div>
      <div class="modal-row"><span>${loverName} 好感度</span><span class="chg-neg">变为 20</span></div>
    `, callback)
    return
  }

  const canRecover = (player.money ?? 0) >= 300

  window._loverRecover = () => {
    if ((player.money ?? 0) < 300) return
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    player.money = Math.max(0, (player.money ?? 0) - 300)
    saveState()
    showModal(`
      <div class="modal-title">挽回成功</div>
      <div class="event-box" style="margin-bottom:12px;line-height:1.8">
        你花了不少心思和零花钱去补偿 ${loverName}，总算把这段关系勉强拉了回来。<br>
        对方虽然没有继续追问，但也认真提醒了你：<br>
        “如果真的在乎，就多陪陪我，别总让我一个人猜。” 
      </div>
      <hr class="modal-divider">
      <div class="modal-row"><span>零花钱</span><span class="chg-neg">-300</span></div>
    `, callback)
  }

  window._loverBreakup = () => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''
    applyChanges({ mental: -30, health: -15 })
    markClassmateAsEx(loverRel)
    saveState()
    showModal(`
      <div class="modal-title">残忍分手</div>
      <div class="event-box" style="margin-bottom:12px;line-height:1.8">
        你没有再继续挽留，只是任由这段关系在沉默里断掉。<br>
        ${loverName} 看着你，很久都没有再说话，最后只留下一句：<br>
        “原来我真的没那么重要。” 
      </div>
      <hr class="modal-divider">
      <div class="modal-row"><span>心理健康</span><span class="chg-neg">-30</span></div>
      <div class="modal-row"><span>身体健康</span><span class="chg-neg">-15</span></div>
      <div class="modal-row"><span>${loverName} 的关系状态</span><span class="chg-neg">变为前任</span></div>
      <div class="modal-row"><span>${loverName} 好感度</span><span class="chg-neg">变为 20</span></div>
    `, callback)
  }

  showModal(`
    <div class="modal-title">喜新厌旧</div>
    <div class="event-box" style="margin-bottom:14px;line-height:1.8">
      你已经连续三个回合没有主动和 ${loverName} 互动了。<br>
      对方终于忍不住找上你，语气失望得发沉：<br>
      “你是不是根本没那么在乎我？如果一直都是我在等，那这段关系还有什么意义？”<br>
      话说到这里，分手几乎只差你一句回应。
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn full-width ${canRecover ? '' : 'btn-disabled'}" onclick="_loverRecover()" ${canRecover ? '' : 'disabled'}>诚意挽回（300零花钱）</button>
      <button class="btn btn-primary full-width" onclick="_loverBreakup()">残忍分手</button>
    </div>
  `, null, true, true)
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
    <div class="modal-title">你选择了：${choice.label}</div>
    <div class="choice-result-box" style="margin-bottom:12px">${choice.desc}</div>
    <hr class="modal-divider">
    ${effectRows}
  `, cb)
}

// ─── 会考强制弹窗 ─────────────────────────────────────────

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

// ─── 分科事件 ─────────────────────────────────────────────

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
    if (p) {
      if (relations.classmates.includes(p)) {
        addClassmateAffinity(p, ae.delta)
        unlockClassmateBond(p)
      }
      else p.affinity = clamp(p.affinity + ae.delta)
    }
  } else if (ae.group === 'teachers') {
    relations.teachers.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
  } else if (ae.group === 'classmates') {
    relations.classmates.forEach(p => {
      addClassmateAffinity(p, ae.delta)
      unlockClassmateBond(p)
    })
  } else if (ae.group === 'all') {
    relations.teachers.forEach(p => { p.affinity = clamp(p.affinity + ae.delta) })
    relations.classmates.forEach(p => {
      addClassmateAffinity(p, ae.delta)
      unlockClassmateBond(p)
    })
  }
  saveState()
}

// ─── 自动开月 ─────────────────────────────────────────────

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
  updateLoverInteractionStreakOnMonthStart()
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
  player.energy = player.maxEnergy ?? 4   // 先重置精力，再应用事件效果（事件可能扣精力）
  player.usedInteractions = []
  player.usedActivities = []
  player.usedSubjects = []

  if (player.currentEvent?.effect) applyChanges(player.currentEvent.effect)
  if (player.currentEvent?.affinityEffect) applyAffinityEffect(player.currentEvent.affinityEffect)

  // 精力类标签（在事件应用后再调整）
  if (hasTag('motor') && Math.random() < 0.3) {
    player.energy = Math.min(player.maxEnergy ?? 4, player.energy + 1)
  }
  if (hasTag('sloth') && Math.random() < 0.3) {
    player.energy = Math.max(0, player.energy - 1)
    player.mental = Math.min(100, (player.mental || 0) + 5)
    player.health = Math.min(100, (player.health || 0) + 5)
  }

  // 家庭类标签
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

// ─── 状态栏 ─────────────────────────────────────────────

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
    showModal('<div class="modal-title">精力耗尽</div><p class="muted tc" style="padding:4px 0 8px">这个月的精力已经用完了。<br>等下个月再继续安排吧。</p>')
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

  // 连续三次只刷同一科目
  if (hist.length >= 3) {
    const tail = hist.slice(-3)
    if (tail.every(s => s === tail[0])) {
      player.pendingBias = {
        type: 'streak', subject: tail[0],
        message: `你已经连续 3 次刷 ${tail[0]} 了，继续偏科会影响整体成绩。`,
      }
      saveState(); return
    }
  }

  // 连续十次没有刷某一科目
  if (hist.length >= 11) {
    const last10 = hist.slice(-10)
    const neglected = trackedSubjects.filter(s => hist.includes(s) && !last10.includes(s))
    if (neglected.length > 0) {
      player.pendingBias = {
        type: 'neglect', subject: neglected[0],
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

  // 即将连续三次只刷同一科目
  if (hist.length >= 2 && hist[hist.length - 1] === hist[hist.length - 2]) {
    warnings.push(`⚠️ 你已经连续 2 次刷 ${hist[hist.length - 1]}，再刷一次就会触发偏科惩罚`)
  }

  // 即将连续十次没刷某科
  if (hist.length >= 10) {
    const last9 = hist.slice(-9)
    trackedSubjects.filter(s => hist.includes(s) && !last9.includes(s)).slice(0, 2).forEach(s => {
      warnings.push(`⚠️ ${s} 已经连续 9 次没刷，再不补上就会触发偏科惩罚`)
    })
  }

  return warnings
}

// ─── 小游戏首次引导 ─────────────────────────────────────

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
    effect = { learning: -20 }
  } else {
    title = '日常学习'
    text = '高中课程逐渐加深，新的内容不断增加，想完全跟上并不轻松。'
    effect = { learning: -20 }
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

