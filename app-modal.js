/* ============================================================
   Modal helpers
   ============================================================ */

function showModal(html, callback, hideOk = false, noDismiss = false) {
  document.getElementById('modal-body').innerHTML = html
  document.getElementById('modal-overlay').classList.remove('hidden')
  document.getElementById('modal-ok').style.display = hideOk ? 'none' : ''
  _modalCb = callback || null
  _modalNoDismiss = noDismiss
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden')
  document.getElementById('modal-ok').style.display = ''
  _modalNoDismiss = false
  const cb = _modalCb
  _modalCb = null
  scrollToTop()
  cb?.()
}

function handleOverlayClick(e) {
  if (_modalNoDismiss) return
  if (e.target === document.getElementById('modal-overlay')) closeModal()
}
