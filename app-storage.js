/* ============================================================
   Persistence and calendar helpers
   ============================================================ */

function loadState() {
  try {
    const sp = localStorage.getItem('hs_player')
    player = sp ? { ...DEFAULT_PLAYER, ...JSON.parse(sp) } : { ...DEFAULT_PLAYER }
  } catch {
    player = { ...DEFAULT_PLAYER }
  }
  player.maxEnergy = DEFAULT_PLAYER.maxEnergy
  player.energy = Math.max(0, Math.min(player.maxEnergy, Math.round(player.energy ?? player.maxEnergy)))

  try {
    const sr = localStorage.getItem('hs_relations')
    if (sr) {
      const loaded = JSON.parse(sr)
      const reconstructRel = (pool, activeIds, saved, extraBuilder = () => ({})) => {
        const defs = activeIds.map(id => pool.find(t => t.id === id)).filter(Boolean)
        return defs.map(def => {
          const sv = saved.find(t => t.id === def.id)
          return {
            id: def.id,
            affinity: sv?.affinity ?? def.defaultAffinity,
            bonded: sv?.bonded ?? false,
            ...extraBuilder(sv),
          }
        })
      }
      relations = {
        teachers: reconstructRel(
          TEACHER_POOL,
          player.activeTeachers || [],
          loaded.teachers || [],
          sv => ({
            hostilityEventDone: sv?.hostilityEventDone ?? false,
          })
        ),
        classmates: reconstructRel(
          CLASSMATE_POOL,
          player.activeClassmates || [],
          loaded.classmates || [],
          sv => ({
            lover: sv?.lover ?? false,
            exLover: sv?.exLover ?? false,
            romanceEventDone: sv?.romanceEventDone ?? false,
            romanceDeclined: sv?.romanceDeclined ?? false,
            interactionBlocked: sv?.interactionBlocked ?? false,
          })
        ),
      }
    } else {
      relations = deepClone(DEFAULT_RELATIONS)
    }
  } catch {
    relations = deepClone(DEFAULT_RELATIONS)
  }

  try {
    const sr = localStorage.getItem('hs_runtime')
    restoreRuntimeState(sr ? JSON.parse(sr) : {})
  } catch {
    clearRuntimeState()
  }
}

function saveState() {
  localStorage.setItem('hs_player', JSON.stringify(player))
  localStorage.setItem('hs_relations', JSON.stringify(relations))
  localStorage.setItem('hs_runtime', JSON.stringify(getSerializableRuntimeState()))
}

function getMonthInfo(month) {
  const m = Math.min(Math.max(1, month), TOTAL_MONTHS)
  const grade = m <= 7 ? '高一' : m <= 14 ? '高二' : '高三'
  const yearOffset = (m - 1) % 7
  const actualMonth = MONTH_MAP[m - 1]
  const semesters = ['上学期', '上学期', '寒假', '寒假', '下学期', '下学期', '暑假']
  const semester = semesters[yearOffset]
  return { grade, month: actualMonth, semester, seq: m }
}

function getGradeLabel(month) {
  const info = getMonthInfo(month)
  return `${info.grade} · ${info.semester}`
}
