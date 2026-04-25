/* ============================================================
   App runtime state
   ============================================================ */

let player = {}
let relations = {}
let currentPage = 'home'
let currentQuiz = null
let currentExam = null
let currentGaokao = null
let currentOlympiad = null
let currentEsportsExam = null
let currentSocialTab = 'teachers'
let _quizTimer = null

let _pendingTags = []
let _pendingPlayerName = ''
let _tagRerollUsed = false
let _tutorialStep = 0
let _choicePopupCb = null
let _subjectSelCb = null
let _subjectSelPending = []
let _introTimer = null
let _placementAnswers = []
let _placementActive = false
let snakeHandle = null
let snakeNextDir = { x: 1, y: 0 }
let snakeCurDir = { x: 1, y: 0 }
let _modalCb = null
let _modalNoDismiss = false

function getSerializableRuntimeState() {
  return {
    currentPage,
    currentSocialTab,
    currentQuiz,
    currentExam,
    currentGaokao,
    currentOlympiad,
    currentEsportsExam: currentEsportsExam
      ? { ...currentEsportsExam, callback: null }
      : null,
  }
}

function restoreRuntimeState(saved = {}) {
  currentPage = ['home', 'social', 'study', 'fun'].includes(saved.currentPage) ? saved.currentPage : 'home'
  currentSocialTab = saved.currentSocialTab === 'classmates' ? 'classmates' : 'teachers'
  currentQuiz = saved.currentQuiz || null
  currentExam = saved.currentExam || null
  currentGaokao = saved.currentGaokao || null
  currentOlympiad = saved.currentOlympiad || null
  currentEsportsExam = saved.currentEsportsExam
    ? { ...saved.currentEsportsExam, callback: () => renderHome() }
    : null
}

function clearRuntimeState() {
  currentPage = 'home'
  currentSocialTab = 'teachers'
  currentQuiz = null
  currentExam = null
  currentGaokao = null
  currentOlympiad = null
  currentEsportsExam = null
  _placementActive = false
  _placementAnswers = []
  clearQuizTimer()
}
