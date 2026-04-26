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

  const bondedCount = (arr) => arr.filter(p => p.bonded || p.lover).length

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

const CLASSMATE_ROMANCE_EVENTS = {
  wang: {
    story: '晚风吹过操场，林和像平时那样先问你冷不冷、累不累，话到一半却忽然安静下来。他攥了攥袖口，低声说：“我好像总是先顾着所有人，可最近我最想顾着的人，变成你了。”他抬头看你，目光难得没有躲开，“你愿不愿意……让我以后更偏心你一点？”',
    accept: {
      label: '接受心意',
      result: '你点头的瞬间，林和像是终于把憋了很久的一口气放了出来。他先是愣了一秒，随后耳尖一点点红起来，低低笑了：“那我以后就可以光明正大先顾你了。”那句“先顾你”说得很轻，却比任何热闹的表白都更真。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你把话说得很轻，也尽量不让这份认真落空。林和怔了怔，还是很快露出惯常的温和笑意：“好，我明白。”他仍旧体贴地陪你走回教室，只是那晚他安静得比平时久了一点。',
      effect: { mental: 5 },
    },
  },
  li_s: {
    story: '苏知把讲到一半的题停住，像是在重新组织一段她并不熟练的表达。“我算过很多事的最优解，”她看着你，语气还是很平，却明显比平时慢，“但你不太一样。和你待在一起的时候，我会开始主动修正自己。”她顿了顿，像终于得出结论，“所以，你要不要和我试试？”',
    accept: {
      label: '接受心意',
      result: '你给出肯定回答后，苏知沉默了半秒，像是在确认自己没有听错。随后她很轻地呼了口气，难得露出一点近乎松弛的笑意：“好，那我以后就不只是帮你讲题了。”那句平静的话里，藏着她极少示人的温柔。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你把答案说得认真又温和。苏知听完后点了点头，没有追问，只是把那点外露的情绪重新收回一贯的冷静里：“明白了。”她依旧会帮你分析题目，只是那天之后，语气里多了一点你才能察觉的克制。',
      effect: { mental: 5 },
    },
  },
  zhao: {
    story: '周默站在走廊窗边，手里捏着一张写了又划掉很多次的小纸条。你走近时，她明显紧张得肩膀都缩了缩，却还是把纸条递给你：“我、我怕自己当面说不好。”她声音很轻，像怕惊动空气，“可是我真的很想告诉你……如果可以的话，我想站到离你更近的位置。”',
    accept: {
      label: '接受心意',
      result: '你接过那张纸，也认真给了她想听的回应。周默怔住了好几秒，随后眼睛一点点亮起来，像终于有人真的把她从人群里看见。“原来……真的可以啊。”她小声说着，连笑意都带着珍惜。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你很轻地把答案说清楚，也小心接住了她的勇气。周默点点头，把纸条慢慢收回掌心，轻声说：“谢谢你愿意认真看完。”她没有让场面变得难堪，只是那份小心翼翼比平时更明显了一点。',
      effect: { mental: 5 },
    },
  },
  chen_s: {
    story: '陈丰难得没有先开玩笑，只是把一盒牛奶轻轻放到你桌上，低头盯着包装看了好一会儿。“我平时总爱请客、总爱热场，搞得像什么都不缺。”他自嘲地笑了笑，随后看向你，“但你不一样。我想让你喜欢的不是这些，是我。”',
    accept: {
      label: '接受心意',
      result: '你没有让他继续悬着，直接给了回应。陈丰像是整个人都松了一下，随后又笑起来，只是这次笑意比平时的热闹更安静、更真。“那我以后终于能不用靠请客刷存在感了。”他说完，眼睛亮得厉害。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你很认真地回应了他，也尽量不让这份真心落空。陈丰安静了两秒，还是把笑重新挂回脸上：“行，至少这次算我真心实意地输了一回。”他嘴上轻松，眼底那点落空却藏得不算成功。',
      effect: { mental: 5 },
    },
  },
  lin_s: {
    story: '程肃把写到一半的计划表推到你面前，最下面空了一栏。他平时总是干脆利落，这次却难得停顿了很久。“这一栏我想了很多种安排，”他看着你，语气平稳却比平时更郑重，“最后发现，比起写任务，我更想把你写进以后。”',
    accept: {
      label: '接受心意',
      result: '你答应以后，程肃先是安静地看了你一眼，随后才像终于确认了结果，极轻地呼出一口气。“好。”他拿起笔，在计划表最后一栏很认真地写下你的名字，“那这项安排，从现在开始长期有效。”',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你把话说得很平和，也给足了他尊重。程肃沉默了一会儿，最终只是点头，把计划表重新合上：“明白了。”他没有失态，只是那份一向清晰的镇定里，第一次露出了一点不太会处理的空白。',
      effect: { mental: 5 },
    },
  },
  zhang_s: {
    story: '王实站在教室门口，像是把一句话在心里练了无数遍，真正开口时还是紧张得有点结巴。“我、我知道我不太会说，也总是、总是没什么存在感。”他攥紧手指，耳朵红得厉害，“但我还是想问你……能不能让我以后更名正言顺地站在你旁边？”',
    accept: {
      label: '接受心意',
      result: '你刚点头，王实整个人都像没反应过来，怔了两秒才连呼吸都乱掉似的笑起来。“真、真的啊？”他连声音都在发抖，可眼睛亮得不像话，像终于有一件事是他鼓起勇气争取到了的。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你很小心地说出了答案。王实明显僵了一下，随后赶紧点头，像生怕自己再给你添什么负担：“没、没关系，你愿意认真听我说就很好了。”他还是会对你好，只是更小心了一点。',
      effect: { mental: 5 },
    },
  },
  wu_s: {
    story: '许信抱着手臂站在走廊边，明明平时谁都敢怼，这会儿却像比打架还紧张。她偏头看了你一眼，耳尖先红了：“我平时不爱整那些弯弯绕绕的，但这事我得说明白。”她顿了顿，声音忽然放低，“我喜欢你，不想只当你兄弟。”',
    accept: {
      label: '接受心意',
      result: '你答应的那一刻，许信先是愣住，接着偏过头骂了句很轻的“靠”，像是根本没想到自己真能等到这个答案。她重新看向你时，眼里那点藏不住的高兴亮得惊人：“行，那我以后可就不收着了。”',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你尽量把拒绝说得温和。许信沉默了两秒，抬手抓了抓后颈，还是很干脆地点头：“懂了。”她没让你难堪，只是那股平时横冲直撞的气势，第一次明显收了下去。',
      effect: { mental: 5 },
    },
  },
  liu_s: {
    story: '柳颜站在空教室的镜子前，像终于卸掉了在人前维持得刚刚好的表情。她没有先笑，只是很轻地问你：“如果没有那些灯光，没有别人看着，我这样还值不值得被喜欢？”没等你回答，她又补了一句，“我想知道，你会不会愿意喜欢真正的我。”',
    accept: {
      label: '接受心意',
      result: '你给出回答时，柳颜明显愣了一下，像是没想到自己真的能被这样接住。随后她眼里的防备一点点散开，露出一个比平时所有漂亮笑容都更真实的神情：“那我是不是终于不用一直赢了。”',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你认真地回应了她的真心，也尽量不让她难堪。柳颜安静地听完，还是弯起唇角笑了笑，只是那笑意没完全到眼底：“好，我知道了。”她维持住了体面，可你仍能看见她把那点失落悄悄收回去。',
      effect: { mental: 5 },
    },
  },
  sun_s: {
    story: '李回站在窗边，看了很久外面的夜色，才转过头来。“我本来以为自己第二次走高三，什么都该看淡一点。”他声音很低，却很稳，“可和你待久了以后，我反而开始重新在意以后了。”他停顿片刻，认真看向你，“你愿不愿意，和我一起把这条路走完？”',
    accept: {
      label: '接受心意',
      result: '你答应以后，李回没有立刻说很多话，只是看着你安静笑了一下，那笑意比平时整个人都鲜活。“好。”他低声说着，像终于把一件很重却很重要的事放稳了，“那这次我不是一个人走了。”',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你很认真地回答了他。李回听完后点点头，没有勉强，也没有失态，只是把视线重新放回窗外，低声说了一句“我知道了”。他的平静没有碎掉，只是更安静了一些。',
      effect: { mental: 5 },
    },
  },
  zhou_s: {
    story: '张忧把一张写满计划的纸攥得有些皱，像是鼓起了比考试还大的勇气。“我总觉得自己哪里都不够好，也总怕喜欢谁会不会变成新的负担。”她声音有点发抖，眼神却格外认真，“可是如果对象是你，我会想试一试。”',
    accept: {
      label: '接受心意',
      result: '你点头的瞬间，张忧像是整个人都从绷紧中松下来了一点，眼眶甚至有点发红。她低头笑了笑，像终于给自己争取到了一件不会被慌张毁掉的好事：“原来我也可以等到这种答案。”',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你把话说得尽量柔和，不想让她更自责。张忧听完后轻轻点头，先反过来跟你说了句“谢谢你认真听我说”。她努力让自己看起来平静，可你还是能看出她在很用力地消化失落。',
      effect: { mental: 5 },
    },
  },
  zheng_s: {
    story: '刘闯靠在栏杆边，难得没先用玩笑或脾气把场面顶过去。他沉默了一会儿，才很直接地开口：“我知道自己脾气烂、事也多，可我就是想跟你把这话说明白。”他看着你，眼神很硬，语气却很真，“我喜欢你，认真的。”',
    accept: {
      label: '接受心意',
      result: '你答应后，刘闯先是一愣，像完全没准备好真能听到这句。下一秒他低头骂了句很轻的脏话，又忍不住笑起来：“行，那我以后可真不跟你装了。”那笑意罕见地没有半点刺，只剩高兴。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你把答案说得认真，也尽量不让他的勇气白白摔在地上。刘闯听完后安静了两秒，最后只偏过头啧了一声：“知道了。”他没再多说，可那股硬撑着不让自己太狼狈的劲，比平时更明显。',
      effect: { mental: 5 },
    },
  },
  huang_s: {
    story: '吴理抱着一叠表格站在你面前，像是连告白都想先整理清楚。可真正开口时，她还是罕见地乱了节奏：“我知道我平时总爱管你，也总怕自己是不是太烦。”她抿了抿唇，认真看着你，“可如果是喜欢你这件事，我不想再拐弯了。”',
    accept: {
      label: '接受心意',
      result: '你给出回应后，吴理明显怔了一下，像是所有提前演练过的后续都忘了。过了两秒，她才慢慢笑起来，连声音都轻了不少：“那我以后是不是可以名正言顺地多管你一点了。”那句别扭的欢喜，让人很难不心软。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你很认真地把拒绝说清楚。吴理安静听完，手里的表格被她捏得更紧了些，最后还是努力把语气放稳：“好，我知道了。”她依旧会照顾你，只是那份主动里多了点刻意收住的分寸。',
      effect: { mental: 5 },
    },
  },
}

function getClassmateRomanceEvent(def) {
  return CLASSMATE_ROMANCE_EVENTS[def.id] || {
    story: `${def.name} 看着你，像是终于鼓起了很大勇气：“我想和你不只是现在这样的关系。你愿意试试吗？”`,
    accept: {
      label: '接受心意',
      result: '你给出了肯定回答，对方的眼睛一下亮了起来。那种藏了很久的期待，终于在这一刻有了归处。',
      effect: { mental: 5 },
    },
    reject: {
      label: '委婉拒绝',
      result: '你尽量把答案说得温和，也认真接住了这份心意。空气安静了一瞬，但至少你们都没有逃开这份真诚。',
      effect: { mental: 5 },
    },
  }
}

function getClassmateAffinityColor(rel) {
  if (rel.lover || rel.affinity > 100) return '#ef6aa8'
  if (rel.bonded || rel.affinity >= 100) return '#c9952a'
  if (rel.affinity >= 80) return '#4caf72'
  if (rel.affinity >= 60) return '#4d9fd4'
  if (rel.affinity >= 40) return '#e09040'
  return '#b8b3aa'
}

function getClassmateAffinityLabel(rel) {
  if (rel.lover) return '情深意浓 ❤️'
  if (rel.exLover) return '旧日情分'
  if (rel.bonded) return '知己之交 ✨'
  if (rel.affinity >= 80) return '关系很好'
  if (rel.affinity >= 60) return '关系不错'
  if (rel.affinity >= 40) return '普通朋友'
  if (rel.affinity >= 20) return '有些疏远'
  if (rel.affinity >= 1) return '关系紧张'
  return '剑拔弩张'
}

function getClassmateBadge(rel) {
  if (rel.lover) return `<span class="bonded-badge romance-badge">❤️ 恋人</span>`
  if (rel.exLover) return `<span class="bonded-badge" style="background:#6f768533;color:#6f7685">💔 前任</span>`
  if (rel.bonded) return `<span class="bonded-badge">✨ 知己</span>`
  return ''
}

function showClassmateRomanceEvent(rel, def, onDone = () => {}) {
  if (!shouldTriggerClassmateRomanceEvent(rel)) {
    onDone()
    return
  }

  rel.romanceEventDone = true
  saveState()

  const romanceEvent = getClassmateRomanceEvent(def)
  const finishChoice = (accepted) => {
    _modalCb = null
    document.getElementById('modal-overlay').classList.add('hidden')
    document.getElementById('modal-ok').style.display = ''

    const choice = accepted ? romanceEvent.accept : romanceEvent.reject
    const { affinity: aff = 0, ...statChanges } = choice.effect || {}

    if (accepted) {
      rel.lover = true
      rel.exLover = false
      rel.romanceDeclined = false
      if (aff) addClassmateAffinity(rel, aff)
    } else {
      rel.romanceDeclined = true
      rel.bonded = false
      rel.affinity = 80
    }
    applyChanges(statChanges)
    saveState()

    const statRows = Object.entries(statChanges).map(([k, v]) =>
      `<div class="modal-row"><span>${STAT_LABELS[k]}</span><span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span></div>`
    ).join('')
    const affRow = accepted
      ? (aff
        ? `<div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff > 0 ? 'chg-pos' : 'chg-neg'}">${aff > 0 ? '+' : ''}${aff}</span></div>`
        : '')
      : `<div class="modal-row"><span>与 ${def.name} 好感度</span><span class="chg-neg">回落至 80</span></div>`
    const relationRow = accepted
      ? `<div class="modal-row"><span>关系状态</span><span class="chg-pos">恋人 ❤️</span></div>`
      : `<div class="modal-row"><span>关系状态</span><span class="info-val">知己上限锁定为 100</span></div>`

    showModal(`
      <div class="romance-event-modal">
        <div class="bond-event-icon">💗</div>
        <div class="modal-title romance-event-title">${accepted ? '心意相通 ❤️' : '把话说开了'}</div>
        <div class="event-box romance-event-box" style="font-size:13px;margin-bottom:12px;">${choice.result}</div>
        ${(statRows || affRow || relationRow) ? `<hr class="modal-divider">${relationRow}${statRows}${affRow}` : ''}
      </div>
    `, onDone)
  }

  window._acceptRomance = () => finishChoice(true)
  window._declineRomance = () => finishChoice(false)

  showModal(`
    <div class="romance-event-modal">
      <div class="bond-event-icon">💗</div>
      <div class="modal-title romance-event-title">关系升华 ❤️</div>
      <div class="event-box romance-event-box" style="font-size:13px;margin-bottom:14px;">${romanceEvent.story}</div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn full-width romance-btn" onclick="_declineRomance()">${romanceEvent.reject.label}</button>
        <button class="btn btn-primary full-width romance-btn-primary" onclick="_acceptRomance()">${romanceEvent.accept.label}</button>
      </div>
    </div>
  `, null, true, true)
}

function handleClassmateAffinityMilestone(rel, def, justBonded, onDone) {
  if (justBonded && def.bondEvent) {
    window._bondChoice = (idx) => {
      _modalCb = null
      document.getElementById('modal-overlay').classList.add('hidden')
      document.getElementById('modal-ok').style.display = ''

      const choice = def.bondEvent.choices[idx]
      const { affinity: aff = 0, ...statChanges } = choice.effect || {}
      if (aff) addClassmateAffinity(rel, aff)
      applyChanges(statChanges)
      saveState()

      const statRows = Object.entries(statChanges).map(([k, v]) =>
        `<div class="modal-row"><span>${STAT_LABELS[k]}</span><span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span></div>`
      ).join('')
      const affRow = aff
        ? `<div class="modal-row"><span>与 ${def.name} 好感度</span><span class="${aff > 0 ? 'chg-pos' : 'chg-neg'}">${aff > 0 ? '+' : ''}${aff}</span></div>`
        : ''

      showModal(`
        <div class="bond-event-modal">
          <div class="bond-event-icon">${def.emoji}</div>
          <div class="modal-title bond-event-title">✨ ${choice.label}</div>
          ${choice.result ? `<div class="event-box bond-event-box" style="font-size:13px;margin-bottom:12px;">${choice.result}</div>` : ''}
          ${statRows || affRow ? `<hr class="modal-divider">${statRows}${affRow}` : ''}
        </div>
      `, () => showClassmateRomanceEvent(rel, def, onDone))
    }

    showModal(`
      <div class="bond-event-modal">
        <div class="bond-event-icon">${def.emoji}</div>
        <div class="modal-title bond-event-title">关系升华 ✨</div>
        <div class="event-box bond-event-box" style="font-size:13px;margin-bottom:14px;">${def.bondEvent.story}</div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn full-width bond-event-btn" onclick="_bondChoice(0)">${def.bondEvent.choices[0].label}</button>
          <button class="btn btn-primary full-width bond-event-btn-primary" onclick="_bondChoice(1)">${def.bondEvent.choices[1].label}</button>
        </div>
      </div>
    `, null, true, true)
    return
  }

  showClassmateRomanceEvent(rel, def, onDone)
}

function classmateCard(def, rel) {
  const affinityColor = getClassmateAffinityColor(rel)
  const affinityLabel = getClassmateAffinityLabel(rel)
  const bondedBadge = getClassmateBadge(rel)
  const affinityIcon = rel.lover || rel.affinity > 100 ? '❤️' : '✨'
  const mealCost = getClassmateInteractionCost(def, 'meal')
  const canAffordMeal = player.money >= mealCost
  const interacted = (player.usedInteractions || []).includes(def.id)
  const blocked = isClassmateInteractionBlocked(rel)

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
          <span class="affinity-num ${rel.lover || rel.affinity > 100 ? 'romance-affinity-num' : ''}">${rel.affinity} / 100</span>
        </div>
        <div class="affinity-track-v2 ${rel.lover || rel.affinity > 100 ? 'romance-track' : ''}">
          <div class="affinity-fill-v2 ${rel.lover || rel.affinity > 100 ? 'romance-fill' : ''}" style="width:${getClassmateAffinityBarPercent(rel)}%;background:${affinityColor}"></div>
        </div>
        <div class="affinity-milestones ${rel.lover || rel.affinity > 100 ? 'romance-milestones' : ''}">
          <span class="mile ${rel.affinity >= 40 ? 'reached' : ''}">40</span>
          <span class="mile ${rel.affinity >= 60 ? 'reached' : ''}">60</span>
          <span class="mile ${rel.affinity >= 80 ? 'reached' : ''}">80</span>
          <span class="mile mile-icon ${rel.affinity >= 100 ? 'reached' : ''}">${affinityIcon}</span>
        </div>
      </div>
      <div class="pcard-actions">
        ${blocked
          ? `<div class="interact-used-hint blocked-interact-hint">关系已经彻底破裂，无法再互动</div>`
          : interacted
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

  const affinityLabel = rel.bonded           ? '亦师亦友 ✨'
                      : rel.affinity >= 80   ? '关系很好'
                      : rel.affinity >= 60   ? '关系不错'
                      : rel.affinity >= 40   ? '普通师生'
                      : rel.affinity >= 20   ? '有些疏远'
                      : rel.affinity >= 1    ? '明显不满'
                      : '剑拔弩张'

  const bondedBadge = rel.bonded ? `<span class="bonded-badge">✨ 恩师</span>` : ''
  const giftCost = getTeacherInteractionCost(def, 'gift')
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

function showTeacherHostilityEvent(def, rel, callback = () => {}) {
  applyChanges({ learning: -20 })
  saveState()
  showModal(`
    <div class="modal-title">剑拔弩张</div>
    <div class="event-box" style="margin-bottom:12px;line-height:1.8">
      你和 ${def.name} 的关系已经彻底降到了冰点。<br>
      课堂上你下意识开始回避对方，连原本该投入的学习热情都被磨掉了一截。<br>
      这段时间里，你对这门课的积极性明显下降了。
    </div>
    <hr class="modal-divider">
    <div class="modal-row"><span>学习进度</span><span class="chg-neg">-20</span></div>
  `, callback)
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

  const story = pickTeacherInteractionStory(def, rel, type)
  if (!story) return

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
  const justHostile = !rel.hostilityEventDone && rel.affinity <= 0
  if (justHostile) {
    rel.affinity = 0
    rel.hostilityEventDone = true
  }
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
    if (justHostile) {
      showTeacherHostilityEvent(def, rel, () => renderSocial())
    } else if (justBonded && def.bondEvent) {
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
          <div class="bond-event-modal">
            <div class="bond-event-icon">${def.emoji}</div>
            <div class="modal-title bond-event-title">✨ ${choice.label}</div>
            ${choice.result ? `<div class="event-box bond-event-box" style="font-size:13px;margin-bottom:12px;">${choice.result}</div>` : ''}
            ${statRows || affRow ? `<hr class="modal-divider">${statRows}${affRow}` : ''}
          </div>
        `, () => renderSocial())
      }
      showModal(`
        <div class="bond-event-modal">
          <div class="bond-event-icon">${def.emoji}</div>
          <div class="modal-title bond-event-title">关系升华 ✨</div>
          <div class="event-box bond-event-box" style="font-size:13px;margin-bottom:14px;">${def.bondEvent.story}</div>
          <div style="display:flex;gap:8px;margin-top:4px">
            <button class="btn full-width bond-event-btn" onclick="_bondChoice(0)">${def.bondEvent.choices[0].label}</button>
            <button class="btn btn-primary full-width bond-event-btn-primary" onclick="_bondChoice(1)">${def.bondEvent.choices[1].label}</button>
          </div>
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
  if (isClassmateInteractionBlocked(rel)) {
    showModal(`
      <div class="modal-title">关系已决裂</div>
      <p class="muted tc" style="line-height:1.8">你们之间的关系已经无法修复，对方不会再回应你的互动。</p>
    `)
    return
  }

  const interaction = def.interactions[type]
  if (!interaction) return

  const story = pickClassmateInteractionStory(def, rel, type)
  if (!story) return

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
  addClassmateAffinity(rel, totalAffinityChange)
  const justBonded = unlockClassmateBond(rel)
  saveState()

  const rows = Object.entries(statChanges).map(([k, v]) =>
    `<div class="modal-row">
      <span>${STAT_LABELS[k]}</span>
      <span class="${v > 0 ? 'chg-pos' : 'chg-neg'}">${v > 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('')

  const afterInteract = () => {
    handleClassmateAffinityMilestone(rel, def, justBonded, () => renderSocial())
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
