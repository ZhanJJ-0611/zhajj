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

  // 兼容旧存档或异常流程导致的人际数据缺失
  if (!Array.isArray(relations.teachers) || relations.teachers.length === 0 || !Array.isArray(player.activeTeachers) || player.activeTeachers.length === 0) {
    initActiveTeachers()
  }
  if (!Array.isArray(relations.classmates) || relations.classmates.length === 0 || !Array.isArray(player.activeClassmates) || player.activeClassmates.length === 0) {
    initActiveClassmates()
  }
  if (player.selectedSubjects && player.selectedSubjects.length > 0) {
    filterTeachersForSubjects()
  }

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

const CLASSMATE_GENDER_MAP = {
  wang: 'male',
  li_s: 'female',
  zhao: 'female',
  chen_s: 'male',
  lin_s: 'male',
  zhang_s: 'male',
  wu_s: 'female',
  liu_s: 'female',
  sun_s: 'male',
  zhou_s: 'female',
  zheng_s: 'male',
  huang_s: 'female',
}

const TEACHER_GENDER_MAP = {
  wang_yw: 'female',
  li_sx: 'male',
  zhang_yy: 'female',
  chen_wl: 'male',
  lin_hx: 'female',
  zhao_ls: 'male',
  zhou_dl: 'male',
  sun_sw: 'female',
  zhao_politics: 'male',
}

function getGenderBadge(def, role) {
  const gender = role === 'teacher' ? TEACHER_GENDER_MAP[def.id] : CLASSMATE_GENDER_MAP[def.id]
  if (!gender) return ''
  return `<span class="person-tag gender-tag ${gender === 'male' ? 'gender-tag-male' : 'gender-tag-female'}">${gender === 'male' ? '♂' : '♀'}</span>`
}

const CLASSMATE_ROMANCE_EVENTS = {
  "wang": {
    "story": "晚自习下课后，王小明陪你一起关教室窗户，手里还攥着擦黑板留下的一手粉笔灰。他低着头站了半天，才像终于把勇气一点点攒够：“我好像总是先顾别人，可最近我最想先顾着的人，是你。”他说完耳朵已经红透了，却还是努力抬眼看你，“你愿不愿意，让我以后更光明正大一点站在你身边？”",
    "accept": {
      "label": "接受心意",
      "result": "你点头的瞬间，王小明像是整个人都松了下来。他先是怔了两秒，随后低头笑起来，笑得又轻又傻：“那我是不是终于可以不用装作顺路，也能天天送你回教室了。”那点藏了很久的小心翼翼，在这一刻全变成了明晃晃的高兴。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你把答案说得很轻，也尽量不让这份认真落空。王小明安静听完，手指无意识地捏了捏衣角，还是努力冲你笑了一下：“好，我明白了。”他没有让场面难堪，只是那天之后，看向你的目光比以前更克制了一点。",
      "effect": {
        "mental": 5
      }
    }
  },
  "li_s": {
    "story": "柳如烟把镜子扣在桌面上，像终于不想再借着那个小小的反光面躲着谁。她看了你一会儿，才很轻地开口：“很多人喜欢看我，可我一直分不清，他们到底是在看我，还是在看一个好看的壳。”她顿了顿，眼神却难得认真，“但你不一样。你会听我说话，也会记得我怕什么、想什么。那你要不要……认真喜欢一下真正的我？”",
    "accept": {
      "label": "接受心意",
      "result": "你回应的那一瞬，柳如烟像终于把悬着的心放下了一点。她先是怔住，随后低头笑了，眼睛却亮得很明显：“那我以后是不是终于不用总拿别人和自己比，才能确认自己有没有被偏爱了？”她说得半真半假，可那点藏不住的开心，明晃晃地落在了你面前。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你把答案说得温和，也没有让她的认真显得难堪。柳如烟安静听完，还是努力弯了弯唇角：“好，我知道了。”她把情绪收得很快，可那份平时最擅长维持的从容，这次还是慢了半拍。",
      "effect": {
        "mental": 5
      }
    }
  },
  "zhao": {
    "story": "安敏把写满批注的错题本抱在怀里，明明平时连情绪都要讲效率，这次却像怎么都理不顺。她深吸了一口气，才低声说：“我一直觉得，只要够努力，很多事就可以自己扛过去。”她抬头看你，眼底还带着没散干净的疲惫，“可我最近发现，不是的。我会想见你，想跟你说话，想在快撑不住的时候先想到你。你愿不愿意……让我以后不用一个人扛？”",
    "accept": {
      "label": "接受心意",
      "result": "你给出回应后，安敏先是安静了两秒，像在确认自己是不是听错了。随后她慢慢松了口气，眼圈甚至有点发红：“好。”她抱着错题本的手终于没那么紧了，“那以后如果我又焦虑得不行，你得提醒我，不是所有事都只能靠我一个人。”那句请求已经比很多情话更重。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你认真而平和地回答了她。安敏沉默了一会儿，像是在心里把这件事重新整理归档，最后才轻轻点头：“我明白了。”她没有失态，只是在低头收起错题本时，指尖停顿了片刻。",
      "effect": {
        "mental": 5
      }
    }
  },
  "chen_s": {
    "story": "陈裕难得没先开玩笑，也没拿请客那套把场面糊过去。他坐在看台边，把手里那罐可乐转了半天才开口：“我平时对谁都大大方方的，搞得像什么都不缺。可你不一样。”他抬头看你，语气第一次这么认真，“我不是想让你记得我给过你什么，我是想让你记得我这个人。你愿不愿意试着喜欢一下？”",
    "accept": {
      "label": "接受心意",
      "result": "你给出回应后，陈裕先是愣住，随即低头笑了，笑意里有点不敢相信，也有点藏不住的松快。“行啊。”他故作轻松地挑了挑眉，声音却明显发紧，“那我以后可不能只靠请客刷存在感了。”他说得像玩笑，可眼睛亮得很认真。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你尽量把答案说得温和。陈裕听完后沉默了几秒，才勉强笑着摆摆手：“行，至少这次不是花钱也能买到的结果。”他还是替你把气氛兜住了，只是那层平时很会撑场面的轻松，明显薄了不少。",
      "effect": {
        "mental": 5
      }
    }
  },
  "lin_s": {
    "story": "林辰把一张折得整整齐齐的课程表递给你，纸边对得像尺子量过一样。你翻开时才发现，上面原本写满任务的空白栏里，多出了一行字：“和你一起的时间，不想再靠偶遇。”他别开视线，声音还是很稳，却明显比平时低了点：“我不太会说这种话，所以只能尽量写清楚。你愿不愿意，做我计划之外但最想保留的那一项？”",
    "accept": {
      "label": "接受心意",
      "result": "你答应以后，林辰像是短暂卡机了两秒，随后把那张课程表重新折好，小心放回口袋里。“好。”他看着你，耳朵一点点红起来，“那我之后的长期安排里，就不是只有刷题和作息了。”他说得一本正经，却让人怎么听都觉得温柔。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你把话说得认真又平和。林辰沉默了一会儿，像是在心里把这件事重新归档，最后只低低应了一声“我明白了”。他没有失态，只是在把课程表收回去时，手指明显停顿了半拍。",
      "effect": {
        "mental": 5
      }
    }
  },
  "zhang_s": {
    "story": "庄不停难得没先摆出那副游刃有余的样子，只是把一张揉了又展开的纸攥在手里，笑都笑得有点勉强：“我平时挺会装的，这你肯定知道。”他看着你，声音慢慢低下来，“可对着你，我越来越装不像了。”他停顿了一下，像终于狠下心，“如果我不演了，变成一个没那么厉害、甚至有点无聊的人，你还愿不愿意留在我旁边？”",
    "accept": {
      "label": "接受心意",
      "result": "你给出回应后，庄不停先是呆了两秒，随后像突然松了劲，低头笑起来：“完了，真让你看透了。”他说着说着眼睛却亮得厉害，“那我以后是不是终于不用每次都先把场子热起来，才能名正言顺待在你边上了？”那份轻松里，藏着他少有的真心实意。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你把答案说得尽量轻，也没有让他的认真摔在地上。庄不停安静听完，还是努力扯出一个熟悉的笑：“行，我懂了。”他照旧把场面兜住了，可那层平时最擅长的热闹，这次明显薄了很多。",
      "effect": {
        "mental": 5
      }
    }
  },
  "wu_s": {
    "story": "张小雨攥着一张折得很小的纸，站在你面前时连呼吸都放得很轻，像怕声音大一点这份勇气就会散掉。她看着你，眼神却没有躲开太久：“我以前一直觉得，被别人注意到是很可怕的事。”她顿了一下，耳尖已经红透了，“可是如果那个人是你，好像就不一样了。我想被你记住，也想一直待在你旁边。你愿不愿意试试看？”",
    "accept": {
      "label": "接受心意",
      "result": "你给出回应后，张小雨先是愣住，随后眼睛一点点亮起来，像终于确认自己不是在做梦。她低下头，小声得几乎像耳语：“原来我也可以等到这种答案。”那一刻她整个人都放松了下来，连笑意都带着很轻很轻的珍惜。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你很认真地回应了她，也尽量让这份小心翼翼不至于摔得太重。张小雨安静听完，轻轻点了点头：“谢谢你愿意听我说完。”她没有让场面变得难堪，只是把那张纸重新折起来时，动作比刚才更慢了些。",
      "effect": {
        "mental": 5
      }
    }
  },
  "liu_s": {
    "story": "吴念慈把一张写到一半的待办清单折了起来，难得没有继续往下排。她看着你，像在斟酌一件比班级事务难太多的事：“我平时总是忍不住管这个、管那个，好像不把一切安排好，心里就不踏实。”她停了停，语气很轻，“可对你，我发现我不是想管好一件事，我是想认真照顾一个人。你愿不愿意，让我以后名正言顺地把你放进我的计划里？”",
    "accept": {
      "label": "接受心意",
      "result": "你答应以后，吴念慈明显怔了一下，像所有提前想好的后续都突然乱了顺序。过了两秒，她才低头笑起来：“那我以后管你，就不算多管闲事了。”这句听上去还是她最熟悉的口吻，可里面的欢喜已经完全藏不住了。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你把话说得认真，也尽量不让她的坦白显得狼狈。吴念慈听完后安静地点了点头：“好，我知道了。”她还是把场面稳稳收住了，只是把那张待办清单重新展开时，手指比平时慢了一点。",
      "effect": {
        "mental": 5
      }
    }
  },
  "sun_s": {
    "story": "李回站在窗边，看了很久外面的夜色，才转过头来。“我本来以为自己第二次走高三，什么都该看淡一点。”他声音很低，却很稳，“可和你待久了以后，我反而开始重新在意以后了。”他停顿片刻，认真看向你，“你愿不愿意，和我一起把这条路走完？”",
    "accept": {
      "label": "接受心意",
      "result": "你答应以后，李回没有立刻说很多话，只是看着你安静笑了一下，那笑意比平时整个人都鲜活。“好。”他低声说着，像终于把一件很重却很重要的事放稳了，“那这次我不是一个人走了。”",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你很认真地回答了他。李回听完后点点头，没有勉强，也没有失态，只是把视线重新放回窗外，低声说了一句“我知道了”。他的平静没有碎掉，只是更安静了一些。",
      "effect": {
        "mental": 5
      }
    }
  },
  "zhou_s": {
    "story": "何轶薇把一张折得乱七八糟的纸塞到你手里，表情难得没那么跳脱。你展开一看，上面画了一个歪歪扭扭的小人和一个更歪的爱心，旁边写着：“抽象表达失败，建议本人当面重说。”她挠了挠头，耳朵一点点红起来：“那我重说一下。我喜欢你，不是开玩笑，也不是搞节目效果。你要不要试试和我一起继续抽象下去？”",
    "accept": {
      "label": "接受心意",
      "result": "你刚给出回答，何轶薇就像整个人都亮了起来，先笑了一声，又赶紧捂住脸：“完了，我现在是不是看起来特别傻。”可她嘴角根本压不住，“那以后我可就不是随机抽象了，我要对你定向输出。”这句熟悉的怪话里，全是藏不住的开心。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你很认真地回应了她，也尽量接住了这份勇气。何轶薇听完后安静了一会儿，随后还是弯起唇角：“行，那我就把这段剧情归类成单向彩蛋。”她没让气氛冷掉，只是那份平时总能自己把自己逗乐的轻快，这次慢了一拍。",
      "effect": {
        "mental": 5
      }
    }
  },
  "zheng_s": {
    "story": "刘闯把你叫到天台，嘴上还硬邦邦地说“有事”。可真站到你面前时，他反而半天没吭声，手指把校服衣角都攥皱了。过了很久，他才像豁出去一样抬头：“我不会说那些弯弯绕绕的。”他盯着你，耳朵已经红了，“我就是喜欢你，认真的。你给不给个准话？”",
    "accept": {
      "label": "接受心意",
      "result": "你点头的那一瞬，刘闯先是愣住，像完全没准备好真的会听见这句。下一秒他偏过头低低骂了句脏话，又忍不住笑起来：“行，那以后我可真不跟你装凶了。”嘴上还是那副别扭样，眼睛却亮得不像话。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你把话说得认真，也尽量不让他的勇气白白摔碎。刘闯安静了两秒，最后只很轻地“哦”了一声，硬撑着把表情收回去：“知道了。”他没让你难堪，只是那股平时横着走的劲，明显收了不少。",
      "effect": {
        "mental": 5
      }
    }
  },
  "huang_s": {
    "story": "许婷站在走廊尽头，明明平时说话利落得很，这会儿却难得有点卡壳。她把手插在校服口袋里，像给自己壮胆一样吸了口气：“我不太会说这种事，也不想绕来绕去。”她抬眼看你，语气很直，却比平时轻，“我喜欢你。不是兄弟那种，也不是顺手照顾一下那种。你要不要……跟我认真试试？”",
    "accept": {
      "label": "接受心意",
      "result": "你答应以后，许婷先是怔住，像完全没想到自己真能把这句话等到。随后她低头笑了一下，耳尖红得很明显：“行，那我以后可就不只把你当自己人护着了。”她还是那副干脆样子，可那点藏不住的高兴，几乎全写在眼睛里。",
      "effect": {
        "mental": 5
      }
    },
    "reject": {
      "label": "委婉拒绝",
      "result": "你把话说得很认真，也没有让她的坦白显得狼狈。许婷沉默了片刻，最后点了点头：“好，我知道了。”她没有纠缠，也没有失态，只是把那点刚鼓起来的勇气重新收回去时，明显比平时安静了一些。",
      "effect": {
        "mental": 5
      }
    }
  }
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
      player.loverInteractionThisRound = true
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
  const genderBadge = getGenderBadge(def, 'classmate')
  const affinityIcon = rel.lover || rel.affinity > 100 ? '❤️' : '✨'
  const canTreat = (player.money || 0) > 0
  const interacted = (player.usedInteractions || []).includes(def.id)
  const blocked = isClassmateInteractionBlocked(rel)

  return `
    <div class="person-card-v2">
      <div class="pcard-top">
        <div class="person-avatar">${def.emoji}</div>
        <div class="person-info">
          <div class="person-name">
            ${def.name}
            ${genderBadge}
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
          : `<button class="btn btn-sm interact-btn" onclick="interactClassmate('${def.id}','meal')"${!canTreat ? ' style="opacity:.5"' : ''}>
               🍜 请客
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
  const genderBadge = getGenderBadge(def, 'teacher')
  const canGift = (player.money || 0) > 0
  const interacted = (player.usedInteractions || []).includes(def.id)

  return `
    <div class="person-card-v2">
      <div class="pcard-top">
        <div class="person-avatar">${def.emoji}</div>
        <div class="person-info">
          <div class="person-name">
            ${def.name}
            ${genderBadge}
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
          : `<button class="btn btn-sm interact-btn" onclick="interactTeacher('${def.id}','gift')"${!canGift ? ' style="opacity:.5"' : ''}>
               🎁 赠礼
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
    if ((player.money || 0) <= 0) {
      showModal('<div class="modal-title">零花钱不足</div><p class="muted">当前零花钱必须大于 0，才能赠礼。</p>')
      return
    }
  }

  if (!useEnergy('social')) return

  if (!player.usedInteractions) player.usedInteractions = []
  if (!player.usedInteractions.includes(id)) player.usedInteractions.push(id)
  if (rel.lover) player.loverInteractionThisRound = true

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
    if ((player.money || 0) <= 0) {
      showModal('<div class="modal-title">零花钱不足</div><p class="muted">当前零花钱必须大于 0，才能请客。</p>')
      return
    }
  }

  if (!useEnergy('social')) return

  if (!player.usedInteractions) player.usedInteractions = []
  if (!player.usedInteractions.includes(id)) player.usedInteractions.push(id)
  if (rel.lover) player.loverInteractionThisRound = true

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
