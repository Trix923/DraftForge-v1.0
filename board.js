// ============================================================
// BOARD.JS
// ============================================================

const VERSIONS_URL_B = "https://ddragon.leagueoflegends.com/api/versions.json"
let VERSION_B = "14.24.1"
let URL_CHAMPS_B = `https://ddragon.leagueoflegends.com/cdn/${VERSION_B}/data/en_US/champion.json`

async function resolveVersionB() {
  try {
    const res = await fetch(VERSIONS_URL_B)
    const versions = await res.json()
    VERSION_B = versions[0]
    URL_CHAMPS_B = `https://ddragon.leagueoflegends.com/cdn/${VERSION_B}/data/en_US/champion.json`
  } catch(e) {
    console.warn("Fallback version board")
  }
}

const bs = {
  tool: "hand",  // hand | pen
  color:      "#e84040",
  brushSize:  5,
  team:       "blue",
  isDrawing:  false,
  isPanning:  false,
  startX: 0, startY: 0,
  lastX:  0, lastY:  0,
  panX: 0,  panY: 0,
  panStartMouseX: 0, panStartMouseY: 0,
  zoom: 1,
  undoStack: [],
  redoStack: [],
  tokens: [],
}

let canvas, ctx, mapOuter, mapInner, mapImg, tokensEl
let tokenIdCounter = 0

function bel(id) { return document.getElementById(id) }

// ============================================================
// COORDONNÉES CANVAS
// Le canvas est DANS le div transformé (zoom/pan CSS).
// getBoundingClientRect() renvoie déjà les coords écran post-transform.
// On divise par le ratio CSS→physique pour obtenir les px canvas.
// ============================================================
function getCanvasPos(e) {
  const rect   = canvas.getBoundingClientRect()
  const client = e.touches ? e.touches[0] : e
  return {
    x: (client.clientX - rect.left) * (canvas.width  / rect.width),
    y: (client.clientY - rect.top)  * (canvas.height / rect.height),
  }
}

// ============================================================
// TRANSFORM
// ============================================================
function clampPan() {
  const w = mapOuter.clientWidth
  const h = mapOuter.clientHeight
  const scaledW = w * bs.zoom
  const scaledH = h * bs.zoom
  bs.panX = Math.min(0, Math.max(w - scaledW, bs.panX))
  bs.panY = Math.min(0, Math.max(h - scaledH, bs.panY))
}

function applyTransform() {
  mapInner.style.transform = `translate(${bs.panX}px,${bs.panY}px) scale(${bs.zoom})`
}

// ============================================================
// RESIZE CANVAS (à la taille du conteneur, dpr inclus)
// ============================================================
function resizeCanvas() {
  const dpr  = window.devicePixelRatio || 1
  const data = canvas.toDataURL()
  const w    = mapOuter.clientWidth
  const h    = mapOuter.clientHeight
  if (!w || !h) return
  canvas.width  = w * dpr
  canvas.height = h * dpr
  canvas.style.width  = w + "px"
  canvas.style.height = h + "px"
  // Redessiner l'état précédent
  const img = new Image()
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  img.src = data
}

// ============================================================
// UNDO / REDO
// ============================================================
function snapshotTokens() {
  return JSON.parse(JSON.stringify(bs.tokens))
}

function renderTokensFromSnapshot(tokensSnap) {
  tokensEl.innerHTML = ""
  bs.tokens = tokensSnap
  bs.tokens.forEach(tok => renderToken(tok))
}

function pushUndo() {
  bs.undoStack.push({
    canvas: ctx.getImageData(0, 0, canvas.width, canvas.height),
    tokens: snapshotTokens(),
  })
  if (bs.undoStack.length > 50) bs.undoStack.shift()
  bs.redoStack = []
  updateUndoRedoBtns()
  updateClearBtn()
}

function undo() {
  if (!bs.undoStack.length) return
  bs.redoStack.push({
    canvas: ctx.getImageData(0, 0, canvas.width, canvas.height),
    tokens: snapshotTokens(),
  })
  const state = bs.undoStack.pop()
  ctx.putImageData(state.canvas, 0, 0)
  renderTokensFromSnapshot(state.tokens)
  updateUndoRedoBtns(); saveBoard()
}

function redo() {
  if (!bs.redoStack.length) return
  bs.undoStack.push({
    canvas: ctx.getImageData(0, 0, canvas.width, canvas.height),
    tokens: snapshotTokens(),
  })
  const state = bs.redoStack.pop()
  ctx.putImageData(state.canvas, 0, 0)
  renderTokensFromSnapshot(state.tokens)
  updateUndoRedoBtns(); saveBoard()
}

function updateUndoRedoBtns() {
  const u = bel("btn-undo"), r = bel("btn-redo")
  u.disabled = !bs.undoStack.length; u.style.opacity = bs.undoStack.length ? "" : "0.4"
  r.disabled = !bs.redoStack.length; r.style.opacity = bs.redoStack.length ? "" : "0.4"
}

// ============================================================
// DESSIN
// ============================================================
function startDraw(e) {
  // Outil main → pan
  if (bs.tool === "hand") {
    e.preventDefault()
    bs.isPanning = true
    const client = e.touches ? e.touches[0] : e
    bs.panStartMouseX = client.clientX - bs.panX
    bs.panStartMouseY = client.clientY - bs.panY
    canvas.style.cursor = "grabbing"
    return
  }
  if (e.button === 1) return
  e.preventDefault()
  bs.isDrawing = true
  pushUndo()
  const pos = getCanvasPos(e)
  bs.startX = bs.lastX = pos.x
  bs.startY = bs.lastY = pos.y
  if (bs.tool === "pen") {
    ctx.globalCompositeOperation = "source-over"
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }
}

function doDraw(e) {
  e.preventDefault()

  // Pan (outil main)
  if (bs.isPanning) {
    const client = e.touches ? e.touches[0] : e
    bs.panX = client.clientX - bs.panStartMouseX
    bs.panY = client.clientY - bs.panStartMouseY
    clampPan()
    applyTransform(); return
  }

  if (!bs.isDrawing) return
  const pos = getCanvasPos(e)
  const dpr = window.devicePixelRatio || 1

  if (bs.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out"
    ctx.lineWidth = bs.brushSize * dpr * 4
    ctx.lineCap = "round"
    ctx.beginPath(); ctx.moveTo(bs.lastX, bs.lastY); ctx.lineTo(pos.x, pos.y); ctx.stroke()
    bs.lastX = pos.x; bs.lastY = pos.y; return
  }

  if (bs.tool === "pen") {
    ctx.globalCompositeOperation = "source-over"
    ctx.lineWidth = bs.brushSize * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round"
    ctx.strokeStyle = bs.color
    ctx.lineTo(pos.x, pos.y); ctx.stroke()
    bs.lastX = pos.x; bs.lastY = pos.y; return
  }
}

function stopDraw(e) {
  if (bs.isPanning) {
    bs.isPanning = false
    canvas.style.cursor = bs.tool === "hand" ? "grab" : "crosshair"
    return
  }
  if (!bs.isDrawing) return
  bs.isDrawing = false
  ctx.globalCompositeOperation = "source-over"
  saveBoard()
}

function drawArrow(x1, y1, x2, y2, dpr) {
  const head = Math.max(12, bs.brushSize * dpr * 3)
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2); ctx.lineTo(x2 - head * Math.cos(angle - Math.PI/6), y2 - head * Math.sin(angle - Math.PI/6))
  ctx.moveTo(x2, y2); ctx.lineTo(x2 - head * Math.cos(angle + Math.PI/6), y2 - head * Math.sin(angle + Math.PI/6))
  ctx.stroke()
}

function drawCircle(x1, y1, x2, y2) {
  const cx = (x1+x2)/2, cy = (y1+y2)/2
  const rx = Math.max(1, Math.abs(x2-x1)/2), ry = Math.max(1, Math.abs(y2-y1)/2)
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.stroke()
}

// ============================================================
// ZOOM (molette)
// ============================================================
function zoomAt(mouseX, mouseY, factor) {
  const newZoom = Math.min(6, bs.zoom * factor)
  if (newZoom <= 1) {
    bs.zoom = 1; bs.panX = 0; bs.panY = 0
    applyTransform(); return
  }
  bs.panX = mouseX - (mouseX - bs.panX) * (newZoom / bs.zoom)
  bs.panY = mouseY - (mouseY - bs.panY) * (newZoom / bs.zoom)
  bs.zoom = newZoom
  applyTransform()
}

function onWheel(e) {
  e.preventDefault()
  const rect = mapOuter.getBoundingClientRect()
  zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 0.88)
}

function zoomInCenter()  { zoomAt(mapOuter.clientWidth / 2, mapOuter.clientHeight / 2, 1.3) }
function zoomOutCenter() { zoomAt(mapOuter.clientWidth / 2, mapOuter.clientHeight / 2, 0.77) }

// ============================================================
// TOKENS
// ============================================================
function addToken(champId, imgSrc, xPct, yPct) {
  pushUndo()
  const tok = { id: tokenIdCounter++, champId, imgSrc, xPct, yPct, team: bs.team }
  bs.tokens.push(tok); renderToken(tok); saveBoard()
}

function renderToken(tok) {
  const el = document.createElement("div")
  el.className  = "board-token team-" + tok.team
  el.dataset.id = tok.id
  el.style.left = (tok.xPct * 100) + "%"
  el.style.top  = (tok.yPct * 100) + "%"
  const img = document.createElement("img"); img.src = tok.imgSrc; img.alt = tok.champId
  el.appendChild(img); tokensEl.appendChild(el)
  // Drag vers le strip pour supprimer
  el.draggable = true
  el.addEventListener("dragstart", function(e) {
    e.dataTransfer.setData("tokenId", String(tok.id))
    e.stopPropagation()
  })
  el.addEventListener("mousedown",  ev => startTokenDrag(ev, tok, el))
  el.addEventListener("touchstart", ev => startTokenDrag(ev, tok, el), { passive: false })
}

function removeToken(id) {
  pushUndo()
  bs.tokens = bs.tokens.filter(t => t.id !== id)
  const el = tokensEl.querySelector(`[data-id="${id}"]`); if (el) el.remove()
  saveBoard()
}

function startTokenDrag(e, tok, el) {
  e.preventDefault(); e.stopPropagation()
  pushUndo()
  function onMove(ev) {
    ev.preventDefault()
    const client = ev.touches ? ev.touches[0] : ev
    // Position dans l'espace map (tokens est dans mapInner = espace transformé)
    const tokensRect = tokensEl.getBoundingClientRect()
    tok.xPct = Math.max(0, Math.min(1, (client.clientX - tokensRect.left) / tokensRect.width))
    tok.yPct = Math.max(0, Math.min(1, (client.clientY - tokensRect.top)  / tokensRect.height))
    el.style.left = (tok.xPct * 100) + "%"
    el.style.top  = (tok.yPct * 100) + "%"
  }
  function onUp() {
    saveBoard()
    document.removeEventListener("mousemove",  onMove)
    document.removeEventListener("mouseup",    onUp)
    document.removeEventListener("touchmove",  onMove)
    document.removeEventListener("touchend",   onUp)
  }
  document.addEventListener("mousemove",  onMove)
  document.addEventListener("mouseup",    onUp)
  document.addEventListener("touchmove",  onMove, { passive: false })
  document.addEventListener("touchend",   onUp)
}

function handleDropOnMap(e) {
  e.preventDefault()
  const champId = e.dataTransfer?.getData("champId")
  const imgSrc  = e.dataTransfer?.getData("imgSrc")
  if (!champId) return
  const rect = tokensEl.getBoundingClientRect()
  const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const yPct = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height))
  addToken(champId, imgSrc, xPct, yPct)
}

// ============================================================
// CLEAR / EXPORT
// ============================================================
function updateClearBtn() {
  const hasContent = bs.tokens.length > 0 || bs.undoStack.length > 0
  const btn = document.getElementById("btn-clear")
  btn.disabled            = !hasContent
  btn.style.opacity       = hasContent ? "" : "0.35"
  btn.style.pointerEvents = hasContent ? "" : "none"
}

function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  bs.undoStack = []; bs.redoStack = []
  tokensEl.innerHTML = ""; bs.tokens = []
  updateUndoRedoBtns()
  updateClearBtn()
  localStorage.removeItem("draftforge_board")
}

// ============================================================
// SAUVEGARDE / RESTAURATION
// ============================================================
function saveBoard() {
  localStorage.setItem("draftforge_board", JSON.stringify({
    tokens: bs.tokens,
    canvasData: canvas.toDataURL("image/png"),
  }))
}

function restoreBoard() {
  const raw = localStorage.getItem("draftforge_board")
  if (!raw) return
  try {
    const saved = JSON.parse(raw)
    if (saved.tokens) { bs.tokens = saved.tokens; bs.tokens.forEach(t => renderToken(t)) }
    if (saved.canvasData) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = saved.canvasData
    }
  } catch(e) { localStorage.removeItem("draftforge_board") }
}

// ============================================================
// OUTIL ACTIF
// ============================================================
function setTool(tool) {
  bs.tool = tool
  document.querySelectorAll(".board-tool").forEach(b => b.classList.toggle("active", b.dataset.tool === tool))
  const toolbar = document.querySelector(".board-toolbar")
  toolbar.classList.toggle("pen-inactive", tool !== "pen")
  if (tool === "hand") {
    canvas.style.cursor = "grab"
    canvas.style.pointerEvents = "none"
    tokensEl.style.pointerEvents = "all"
  } else {
    canvas.style.cursor = "crosshair"
    canvas.style.pointerEvents = "auto"
    tokensEl.style.pointerEvents = "none"
  }
}

// ============================================================
// CHAMPIONS
// ============================================================
async function loadBoardChamps() {
  const res  = await fetch(URL_CHAMPS_B)
  const data = await res.json()
  const list = Object.values(data.data).sort((a, b) => a.name.localeCompare(b.name))
  const strip = bel("board-champs-strip")
  list.forEach(function(champ) {
    const imgSrc = `https://ddragon.leagueoflegends.com/cdn/${VERSION_B}/img/champion/${champ.image.full}`
    const card = document.createElement("div")
    card.className    = "board-champ-card"
    card.draggable    = true
    card.dataset.name = champ.name.toLowerCase()
    card.title        = champ.name
    const img = document.createElement("img"); img.src = imgSrc; img.alt = champ.name; img.loading = "lazy"
    card.appendChild(img); strip.appendChild(card)
    card.addEventListener("dragstart", function(e) {
      e.dataTransfer.setData("champId", champ.id)
      e.dataTransfer.setData("imgSrc",  imgSrc)
    })
    card.addEventListener("click", function() { addToken(champ.id, imgSrc, 0.5, 0.5) })
  })
}

function onLanguageChange() { applyTranslations() }

// ============================================================
// INIT
// ============================================================
function initBoard() {
  initNavbar()
  applyTranslations()

  canvas   = bel("board-canvas")
  ctx      = canvas.getContext("2d")
  mapOuter = bel("board-map-outer")
  mapInner = bel("board-map-inner")
  mapImg   = bel("board-map-img")
  tokensEl = bel("board-tokens")

  // Charger la map — resize canvas une fois l'image chargée
  // Le src est déjà défini dans le HTML, on écoute juste l'événement
  if (mapImg.complete && mapImg.naturalWidth) {
    resizeCanvas()
    restoreBoard()
  } else {
    mapImg.onload = function() { resizeCanvas(); restoreBoard() }
    mapImg.onerror = function() { console.warn("Carte non trouvée : map.png") }
  }

  applyTransform()
  updateUndoRedoBtns()
  updateClearBtn()
  canvas.style.cursor = "grab"
  canvas.style.pointerEvents = "none"
  tokensEl.style.pointerEvents = "all"
  document.querySelector(".board-toolbar").classList.add("pen-inactive")
  window.addEventListener("resize", resizeCanvas)

  // Outils
  document.querySelectorAll(".board-tool").forEach(btn => {
    btn.addEventListener("click", function() { setTool(this.dataset.tool) })
  })

  // Couleurs
  document.querySelectorAll(".board-color").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".board-color").forEach(b => b.classList.remove("active"))
      this.classList.add("active"); bs.color = this.dataset.color
      // Repasser en mode crayon si on était en gomme
    })
  })

  // Slider taille
  bel("brush-size").addEventListener("input", function() {
    bs.brushSize = parseInt(this.value)
    bel("brush-label").textContent = this.value + "px"
  })

  // Équipes — met à jour la couleur des bordures des vignettes
  document.querySelectorAll(".board-team").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".board-team").forEach(b => b.classList.remove("active"))
      this.classList.add("active"); bs.team = this.dataset.team
      // Mettre à jour la couleur des bordures du strip
      bel("board-champs-strip").dataset.team = bs.team
    })
  })
  // Init couleur strip
  bel("board-champs-strip").dataset.team = "blue"

  // Undo / Redo
  bel("btn-undo").addEventListener("click", undo)
  bel("btn-redo").addEventListener("click", redo)
  document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" && !e.shiftKey) { e.preventDefault(); undo() }
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" &&  e.shiftKey) { e.preventDefault(); redo() }
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyY")                { e.preventDefault(); redo() }
  })

  // Clear
  bel("btn-clear").addEventListener("click", function() {
    bel("confirm-clear-title").textContent = t("confirmClearTitle")
    bel("confirm-clear-msg").textContent   = t("confirmClearMsg")
    bel("confirm-clear-yes").textContent   = t("confirmClearYes")
    bel("confirm-clear-no").textContent    = t("confirmClearNo")
    bel("confirm-clear-overlay").classList.add("active")
    bel("confirm-clear-yes").onclick = () => { bel("confirm-clear-overlay").classList.remove("active"); clearBoard() }
    bel("confirm-clear-no").onclick  = () => bel("confirm-clear-overlay").classList.remove("active")
  })
  bel("confirm-clear-overlay").addEventListener("click", function(e) {
    if (e.target === this) this.classList.remove("active")
  })

  // Dessin (events sur le canvas)
  canvas.addEventListener("mousedown",  startDraw)
  canvas.addEventListener("mousemove",  doDraw)
  canvas.addEventListener("mouseup",    stopDraw)
  canvas.addEventListener("mouseleave", stopDraw)
  canvas.addEventListener("touchstart", startDraw, { passive: false })
  canvas.addEventListener("touchmove",  doDraw,    { passive: false })
  canvas.addEventListener("touchend",   stopDraw)

  // Pan en mode main (sur mapOuter car canvas est pointer-events:none)
  mapOuter.addEventListener("mousedown", function(e) {
    if (bs.tool !== "hand" || e.target.closest(".board-token")) return
    e.preventDefault()
    bs.isPanning = true
    bs.panStartMouseX = e.clientX - bs.panX
    bs.panStartMouseY = e.clientY - bs.panY
    mapOuter.style.cursor = "grabbing"
  })
  document.addEventListener("mousemove", function(e) {
    if (!bs.isPanning) return
    bs.panX = e.clientX - bs.panStartMouseX
    bs.panY = e.clientY - bs.panStartMouseY
    applyTransform()
  })
  document.addEventListener("mouseup", function() {
    if (!bs.isPanning) return
    bs.isPanning = false
    // Recadrer si la map laisse apparaître du fond noir
    const w = mapOuter.clientWidth
    const h = mapOuter.clientHeight
    const scaledW = w * bs.zoom
    const scaledH = h * bs.zoom
    if (bs.panX > 0) bs.panX = 0
    if (bs.panY > 0) bs.panY = 0
    if (bs.panX < w - scaledW) bs.panX = w - scaledW
    if (bs.panY < h - scaledH) bs.panY = h - scaledH
    applyTransform()
    mapOuter.style.cursor = bs.tool === "hand" ? "grab" : "crosshair"
  })

  // Zoom molette (sur le conteneur outer)
  mapOuter.addEventListener("wheel", onWheel, { passive: false })

  // Drop champions sur la map
  canvas.addEventListener("dragover",   e => e.preventDefault())
  canvas.addEventListener("drop",       handleDropOnMap)
  tokensEl.addEventListener("dragover", e => e.preventDefault())
  tokensEl.addEventListener("drop",     handleDropOnMap)

  // Strip champions : drop d'un token = suppression (comme tier list → pool)
  const strip = bel("board-champs-strip")
  strip.addEventListener("dragover", function(e) {
    e.preventDefault()
    strip.classList.add("drag-remove")
  })
  strip.addEventListener("dragleave", function() {
    strip.classList.remove("drag-remove")
  })
  strip.addEventListener("drop", function(e) {
    e.preventDefault()
    strip.classList.remove("drag-remove")
    const tokenId = parseInt(e.dataTransfer.getData("tokenId"))
    if (!isNaN(tokenId)) removeToken(tokenId)
  })

  // Recherche
  bel("board-search").addEventListener("input", function() {
    const s = this.value.toLowerCase()
    document.querySelectorAll(".board-champ-card").forEach(c => {
      c.classList.toggle("hidden", !c.dataset.name.includes(s))
    })
  })

  resolveVersionB().then(loadBoardChamps)
}

initBoard()
