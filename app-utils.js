/* ============================================================
   App shared utilities
   ============================================================ */

function hasTag(id) { return (player.tags || []).includes(id) }

function getTagObj(id) {
  for (const pool of Object.values(TAG_POOL)) {
    const t = pool.find(x => x.id === id)
    if (t) return t
  }
  return EARNED_TAGS[id] || null
}

function getTagCategory(id) {
  for (const [cat, pool] of Object.entries(TAG_POOL)) {
    if (pool.some(x => x.id === id)) return cat
  }
  return ''
}

function scrollToTop() {
  window.scrollTo(0, 0)
}

function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))) }

function clampClassmateAffinity(v, allowOverflow = false) {
  const max = allowOverflow ? 999 : 100
  return Math.max(0, Math.min(max, Math.round(v)))
}

function addClassmateAffinity(rel, delta) {
  if (!rel) return 0
  const nextValue = (rel.affinity ?? 0) + delta
  const allowOverflow = !!rel.lover
    || (!rel.exLover && !rel.romanceDeclined && (!!rel.bonded || nextValue > 100))
  rel.affinity = clampClassmateAffinity((rel.affinity ?? 0) + delta, allowOverflow)
  return rel.affinity
}

function unlockClassmateBond(rel) {
  const justBonded = !!rel && !rel.bonded && (rel.affinity ?? 0) >= 100
  if (justBonded) {
    rel.bonded = true
    rel.affinity = Math.max(100, Math.round(rel.affinity ?? 0))
  }
  return justBonded
}

function getClassmateAffinityBarPercent(rel) {
  return Math.max(0, Math.min(100, Math.round(rel?.affinity ?? 0)))
}

function hasLoverClassmate() {
  return Array.isArray(relations?.classmates) && relations.classmates.some(rel => rel.lover)
}

function getLoverClassmates() {
  return Array.isArray(relations?.classmates) ? relations.classmates.filter(rel => rel.lover) : []
}

function getBondedClassmates() {
  return Array.isArray(relations?.classmates)
    ? relations.classmates.filter(rel => rel.bonded && !rel.lover)
    : []
}

function getBondedTeachers() {
  return Array.isArray(relations?.teachers)
    ? relations.teachers.filter(rel => rel.bonded)
    : []
}

function isClassmateInteractionBlocked(rel) {
  return !!rel?.interactionBlocked
}

function getInteractableClassmates() {
  return Array.isArray(relations?.classmates)
    ? relations.classmates.filter(rel => !isClassmateInteractionBlocked(rel))
    : []
}

function shouldTriggerClassmateRomanceEvent(rel) {
  return !!rel?.bonded
    && !rel?.lover
    && !rel?.exLover
    && !rel?.romanceEventDone
    && !rel?.interactionBlocked
    && (rel.affinity ?? 0) > 120
}

function deepClone(o) { return JSON.parse(JSON.stringify(o)) }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function rndInt(n) { return Math.floor(Math.random() * n) }
