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

function deepClone(o) { return JSON.parse(JSON.stringify(o)) }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function rndInt(n) { return Math.floor(Math.random() * n) }
