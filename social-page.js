/* ============================================================
   Social Page
   ============================================================ */

// ─── 人际页面 ────────────────────────────────────────────────

function switchSocialTab(tab) {
  currentSocialTab = tab
  saveState()
  renderSocial()
}

function renderSocial() {
  scrollToTop()
  const c = document.getElementById('content')
  const isTeacher = currentSocialTab === 'teachers'

  const bondedCount = (arr) => arr.filter(p => p.bonded).length

  const cardsHtml = isTeacher
    ? relations.teachers.map(rel => {
        const def = TEACHER_POOL.find(t => t.id === rel.id)
        return def ? teacherCard(def, rel) : ''
      }).join('')
    : relations.classmates.map(rel => {
        const def = CLASSMATE_POOL.find(c => c.id === rel.id)
        return def ? classmateCard(def, rel) : ''
      }).join('')

  c.innerHTML = `
    <div class="social-tabs">
      <button class="social-tab ${isTeacher ? 'active' : ''}" onclick="switchSocialTab('teachers')">
        👨‍🏫 老师
        ${bondedCount(relations.teachers) > 0 ? `<span class="tab-bond-dot"></span>` : ''}
      </button>
      <button class="social-tab ${!isTeacher ? 'active' : ''}" onclick="switchSocialTab('classmates')">
        👨‍🎓 同学
        ${bondedCount(relations.classmates) > 0 ? `<span class="tab-bond-dot"></span>` : ''}
      </button>
    </div>
    <div class="card">
      ${cardsHtml}
    </div>
  `
}

function classmateCard(def, rel) {
  const affinityColor = rel.bonded || rel.affinity >= 100 ? '#c9952a'
                      : rel.affinity >= 80 ? '#4caf72'
                      : rel.affinity >= 60 ? '#4d9fd4'
                      : rel.affinity >= 40 ? '#e09040'
                      : '#b8b3aa'

  const affinityLabel = rel.bonded           ? '知己之交 ✨'
                      : rel.affinity >= 80   ? '关系很好'
                      : rel.affinity >= 60   ? '关系不错'
                      : rel.affinity >= 40   ? '普通朋友'
                      : '不太熟悉'

  const bondedBadge = rel.bonded ? `<span class="bonded-badge">✨ 知己</span>` : ''
  const mealCost = -(def.interactions.meal.stories[0]?.effect?.money || 0)
  const canAffordMeal = player.money >= mealCost
  const interacted = (player.usedInteractions || []).includes(def.id)

  return `
    <div class="person-card-v2">
      <div class="pcard-top">
        <div class="person-avatar">${def.emoji}</div>
        <div class="person-info">
          <div class="person-name">
            ${def.name}
            <span class="person-tag">${def.trait}</span>
            ${bondedBadge}
          </div>
          ${def.desc ? `<div class="person-desc">${def.desc}</div>` : ''}
        </div>
      </div>
      <div class="pcard-affinity">
        <div class="affinity-label-row">
          <span class="affinity-status" style="color:${affinityColor}">${affinityLabel}</span>
          <span class="affinity-num">${rel.affinity} / 100</span>
        </div>
        <div class="affinity-track-v2">
          <div class="affinity-fill-v2" style="width:${rel.affinity}%;background:${affinityColor}"></div>
        </div>
        ${!rel.bonded ? `<div class="affinity-milestones">
          <span class="mile ${rel.affinity >= 40 ? 'reached' : ''}">40</span>
          <span class="mile ${rel.affinity >= 60 ? 'reached' : ''}">60</span>
          <span class="mile ${rel.affinity >= 80 ? 'reached' : ''}">80</span>
          <span class="mile ${rel.affinity >= 100 ? 'reached' : ''}">✨</span>
        </div>` : ''}
      </div>
      <div class="pcard-actions">
        ${interacted
          ? `<div class="interact-used-hint">本月已互动</div>`
          : `<button class="btn btn-sm interact-btn" onclick="interactClassmate('${def.id}','meal')"${!canAffordMeal ? ' style="opacity:.5"' : ''}>
               🍜 请客 <span style="font-size:.75em;opacity:.7">-${mealCost}💰</span>
             </button>
             <button class="btn btn-sm interact-btn" onclick="interactClassmate('${def.id}','play')">
               🎮 玩耍
             </button>
             <button class="btn btn-sm interact-btn" onclick="interactClassmate('${def.id}','chat')">
               💬 聊天
             </button>`
        }
      </div>
    </div>
  `
}

function teacherCard(def, rel) {
  const affinityColor = rel.bonded || rel.affinity >= 100 ? '#c9952a'
                      : rel.affinity >= 80 ? '#4caf72'
                      : rel.affinity >= 60 ? '#4d9fd4'
                      : rel.affinity >= 40 ? '#e09040'
                      : '#b8b3aa'

  const affinityLabel = rel.bonded           ? '知己之交 ✨'
                      : rel.affinity >= 80   ? '关系很好'
                      : rel.affinity >= 60   ? '关系不错'
                      : rel.affinity >= 40   ? '普通朋友'
                      : '不太熟悉'

  const bondedBadge = rel.bonded ? `<span class="bonded-badge">✨ 知己</span>` : ''
  const giftCost = -(def.interactions.gift.stories[0]?.effect?.money || 0)
  const canAffordGift = player.money >= giftCost
  const interacted = (player.usedInteractions || []).includes(def.id)

  return `
    <div class="person-card-v2">
      <div class="pcard-top">
        <div class="person-avatar">${def.emoji}</div>
        <div class="person-info">
          <div class="person-name">
            ${def.name}
            <span class="person-tag">${def.trait} · ${def.subject}</span>
            ${bondedBadge}
          </div>
          ${def.desc ? `<div class="person-desc">${def.desc}</div>` : ''}
        </div>
      </div>
      <div class="pcard-affinity">
        <div class="affinity-label-row">
          <span class="affinity-status" style="color:${affinityColor}">${affinityLabel}</span>
          <span class="affinity-num">${rel.affinity} / 100</span>
        </div>
        <div class="affinity-track-v2">
          <div class="affinity-fill-v2" style="width:${rel.affinity}%;background:${affinityColor}"></div>
        </div>
        ${!rel.bonded ? `<div class="affinity-milestones">
          <span class="mile ${rel.affinity >= 40 ? 'reached' : ''}">40</span>
          <span class="mile ${rel.affinity >= 60 ? 'reached' : ''}">60</span>
          <span class="mile ${rel.affinity >= 80 ? 'reached' : ''}">80</span>
          <span class="mile ${rel.affinity >= 100 ? 'reached' : ''}">✨</span>
        </div>` : ''}
      </div>
      <div class="pcard-actions">
        ${interacted
          ? `<div class="interact-used-hint">本月已互动</div>`
          : `<button class="btn btn-sm interact-btn" onclick="interactTeacher('${def.id}','gift')"${!canAffordGift ? ' style="opacity:.5"' : ''}>
               🎁 赠礼 <span style="font-size:.75em;opacity:.7">-${giftCost}💰</span>
             </button>
             <button class="btn btn-sm interact-btn" onclick="interactTeacher('${def.id}','chat')">
               💬 请教
             </button>
             <button class="btn btn-sm interact-btn" onclick="interactTeacher('${def.id}','provoke')">
               😈 挑衅
             </button>`
        }
      </div>
    </div>
  `
}

function interactTeacher(id, type) {
  if (!player.monthStarted) {
    showModal('<div class="modal-title">提示</div><p class="muted">请先在主控面板开始本月。</p>')
    return
  }

  const def = TEACHER_POOL.find(t => t.id === id)
  const rel = relations.teachers.find(t => t.id === id)
  if (!def || !rel) return

  const interaction = def.interactions[type]
  if (!interaction) return

  const story = interaction.stories[rndInt(interaction.stories.length)]

  if (type === 'gift') {
    const giftCost = -(story.effect.money || 0)
    if (giftCost > 0 && player.money < giftCost) {
      showModal(`<div class="modal-title">零花钱不足</div><p class="muted">赠送礼物需要 ${giftCost} 元，当前余额不足。</p>`)
      return
    }
  }

  if (!useEnergy('social')) return

  if (!player.usedInteractions) player.usedInteractions = []
  if (!player.usedInteractions.includes(id)) player.usedInteractions.push(id)

  const { affinity: aff = 0, ...statChanges } = story.effect
  applyChanges(statChanges)

  const affBonus = hasTag('charming') ? 2 : 0
  const totalAffinityChange = aff + affBonus
  rel.affinity = clamp(rel.affinity + totalAffinityChange)
  const justBonded = !rel.bonded && rel.affinity >= 100
  if (justBonded) { rel.bonded = true; rel.affinity = 100 }
  saveState()

  const rows = Object.entries(statChanges).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k]}</span>
      <span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  const afterInteract = () => {
    if (justBonded && def.bondEvent) {
      window._bondChoice = (idx) => {
        _modalCb = null
        document.getElementById('modal-overlay').classList.add('hidden')
        document.getElementById('modal-ok').style.display = ''
        const choice = def.bondEvent.choices[idx]
        const { affinity: aff = 0, ...statChanges } = choice.effect || {}
        applyChanges(statChanges)
        if (aff) rel.affinity = clamp(rel.affinity + aff)
        saveState()
        const statRows = Object.entries(statChanges).map(([k, v]) =>
          `<div class="modal-row"><span>${STAT_LABELS[k]}</span><span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span></div>`
        ).join('')
        const affRow = aff ? `<div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff > 0 ? 'chg-pos' : 'chg-neg'}">${aff > 0 ? '+' : ''}${aff}</span></div>` : ''
        showModal(`
          <div class="bond-event-icon">${def.emoji}</div>
          <div class="modal-title">✨ ${choice.label}</div>
          ${choice.result ? `<div class="event-box" style="font-size:13px;margin-bottom:12px;">${choice.result}</div>` : ''}
          ${statRows || affRow ? `<hr class="modal-divider">${statRows}${affRow}` : ''}
        `, () => renderSocial())
      }
      showModal(`
        <div class="bond-event-icon">${def.emoji}</div>
        <div class="modal-title">关系升华 ✨</div>
        <div class="event-box" style="font-size:13px;margin-bottom:14px;">${def.bondEvent.story}</div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn full-width" onclick="_bondChoice(0)">${def.bondEvent.choices[0].label}</button>
          <button class="btn btn-primary full-width" onclick="_bondChoice(1)">${def.bondEvent.choices[1].label}</button>
        </div>
      `, () => renderSocial(), true)
    } else {
      renderSocial()
    }
  }

  showModal(`
    <div class="modal-title">${interaction.label}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${story.text}</div>
    <hr class="modal-divider">
    ${rows}
    <div class="modal-row">
      <span>与 ${def.name} 好感度</span>
      <span class="${totalAffinityChange > 0 ? 'chg-pos' : totalAffinityChange < 0 ? 'chg-neg' : ''}">${totalAffinityChange > 0 ? '+' : ''}${totalAffinityChange}${affBonus > 0 ? ' 😏' : ''}</span>
    </div>
  `, afterInteract)
}

function interactClassmate(id, type) {
  if (!player.monthStarted) {
    showModal('<div class="modal-title">提示</div><p class="muted">请先在主控面板开始本月。</p>')
    return
  }

  const def = CLASSMATE_POOL.find(c => c.id === id)
  const rel = relations.classmates.find(c => c.id === id)
  if (!def || !rel) return

  const interaction = def.interactions[type]
  if (!interaction) return

  const story = interaction.stories[rndInt(interaction.stories.length)]

  if (type === 'meal') {
    const mealCost = -(story.effect.money || 0)
    if (mealCost > 0 && player.money < mealCost) {
      showModal(`<div class="modal-title">零花钱不足</div><p class="muted">请客吃饭需要 ${mealCost} 元，当前余额不足。</p>`)
      return
    }
  }

  if (!useEnergy('social')) return

  if (!player.usedInteractions) player.usedInteractions = []
  if (!player.usedInteractions.includes(id)) player.usedInteractions.push(id)

  const { affinity: aff = 0, ...statChanges } = story.effect
  applyChanges(statChanges)

  const affBonus = hasTag('charming') ? 2 : 0
  const totalAffinityChange = aff + affBonus
  rel.affinity = clamp(rel.affinity + totalAffinityChange)
  const justBonded = !rel.bonded && rel.affinity >= 100
  if (justBonded) { rel.bonded = true; rel.affinity = 100 }
  saveState()

  const rows = Object.entries(statChanges).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k]}</span>
      <span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  const afterInteract = () => {
    if (justBonded && def.bondEvent) {
      window._bondChoice = (idx) => {
        _modalCb = null
        document.getElementById('modal-overlay').classList.add('hidden')
        document.getElementById('modal-ok').style.display = ''
        const choice = def.bondEvent.choices[idx]
        const { affinity: aff = 0, ...statChanges } = choice.effect || {}
        applyChanges(statChanges)
        if (aff) rel.affinity = clamp(rel.affinity + aff)
        saveState()
        const statRows = Object.entries(statChanges).map(([k, v]) =>
          `<div class="modal-row"><span>${STAT_LABELS[k]}</span><span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span></div>`
        ).join('')
        const affRow = aff ? `<div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff > 0 ? 'chg-pos' : 'chg-neg'}">${aff > 0 ? '+' : ''}${aff}</span></div>` : ''
        showModal(`
          <div class="bond-event-icon">${def.emoji}</div>
          <div class="modal-title">✨ ${choice.label}</div>
          ${choice.result ? `<div class="event-box" style="font-size:13px;margin-bottom:12px;">${choice.result}</div>` : ''}
          ${statRows || affRow ? `<hr class="modal-divider">${statRows}${affRow}` : ''}
        `, () => renderSocial())
      }
      showModal(`
        <div class="bond-event-icon">${def.emoji}</div>
        <div class="modal-title">关系升华 ✨</div>
        <div class="event-box" style="font-size:13px;margin-bottom:14px;">${def.bondEvent.story}</div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn full-width" onclick="_bondChoice(0)">${def.bondEvent.choices[0].label}</button>
          <button class="btn btn-primary full-width" onclick="_bondChoice(1)">${def.bondEvent.choices[1].label}</button>
        </div>
      `, () => renderSocial(), true)
    } else {
      renderSocial()
    }
  }

  showModal(`
    <div class="modal-title">${interaction.label}</div>
    <div class="event-box" style="font-size:13px;margin-bottom:12px;">${story.text}</div>
    <hr class="modal-divider">
    ${rows}
    <div class="modal-row">
      <span>与 ${def.name} 好感度</span>
      <span class="${totalAffinityChange > 0 ? 'chg-pos' : totalAffinityChange < 0 ? 'chg-neg' : ''}">${totalAffinityChange > 0 ? '+' : ''}${totalAffinityChange}${affBonus > 0 ? ' 😏' : ''}</span>
    </div>
  `, afterInteract)
}
