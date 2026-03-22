// ============================================================
// CONFIGURATION
// ============================================================
const VERSIONS_URL = "https://ddragon.leagueoflegends.com/api/versions.json"
let VERSION = "14.24.1" // fallback, remplacé au chargement
let URL_CHAMPS = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/en_US/champion.json`

async function resolveVersion() {
  try {
    const res = await fetch(VERSIONS_URL)
    const versions = await res.json()
    VERSION = versions[0]
    URL_CHAMPS = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/en_US/champion.json`
  } catch(e) {
    console.warn("Impossible de récupérer la version DD, fallback 14.24.1")
  }
}

const DRAFT_ORDER = [
  { team:"blue", type:"ban",  index:0 },
  { team:"red",  type:"ban",  index:0 },
  { team:"blue", type:"ban",  index:1 },
  { team:"red",  type:"ban",  index:1 },
  { team:"blue", type:"ban",  index:2 },
  { team:"red",  type:"ban",  index:2 },
  { team:"blue", type:"pick", index:0 },
  { team:"red",  type:"pick", index:0 },
  { team:"red",  type:"pick", index:1 },
  { team:"blue", type:"pick", index:1 },
  { team:"blue", type:"pick", index:2 },
  { team:"red",  type:"pick", index:2 },
  { team:"red",  type:"ban",  index:3 },
  { team:"blue", type:"ban",  index:3 },
  { team:"red",  type:"ban",  index:4 },
  { team:"blue", type:"ban",  index:4 },
  { team:"red",  type:"pick", index:3 },
  { team:"blue", type:"pick", index:3 },
  { team:"blue", type:"pick", index:4 },
  { team:"red",  type:"pick", index:4 },
]

// ============================================================
// ÉTAT
// ============================================================
const state = {
  lang:          currentLang,
  seriesFormat:  3,
  currentGame:   1,
  wins:          [], // tableau des vainqueurs : ["blue","red","blue"...]
  fearlessPool:  new Set(),
  currentTurn:   0,
  usedChampions: new Set(),
  draftFinished: false,
  sidesSwapped:  false,
  roleFilter:    "all",
}

// ============================================================
// SAUVEGARDE / RESTAURATION DE L'ÉTAT (localStorage)
// On sérialise l'état de la draft à chaque action.
// Set et les slots visuels sont convertis en formats JSON-safe.
// ============================================================
function saveState() {
  // Capturer le contenu actuel de chaque slot
  const slots = []
  document.querySelectorAll(".pick-slot, .ban-slot").forEach(function(slot) {
    const img = slot.querySelector("img.slot-splash, img.slot-icon, img.ban-slot img")
    const banImg = slot.classList.contains("ban-slot") ? slot.querySelector("img") : null
    slots.push({
      team:      slot.dataset.team,
      type:      slot.classList.contains("ban-slot") ? "ban" : "pick",
      index:     slot.dataset.index,
      filled:    slot.classList.contains("slot-filled") || slot.classList.contains("filled"),
      innerHTML: slot.innerHTML,
    })
  })

  const saved = {
    seriesFormat:  state.seriesFormat,
    currentGame:   state.currentGame,
    wins:          state.wins,
    fearlessPool:  [...state.fearlessPool],
    currentTurn:   state.currentTurn,
    usedChampions: [...state.usedChampions],
    draftFinished: state.draftFinished,
    sidesSwapped:  state.sidesSwapped,
    slots:         slots,
    teamBlue:      el("team-name-blue").value,
    teamRed:       el("team-name-red").value,
  }
  localStorage.setItem("draftforge_state", JSON.stringify(saved))
}

function clearSave() {
  localStorage.removeItem("draftforge_state")
}

// Restaure l'état visuel une fois les champions chargés
function restoreVisuals(saved) {
  saved.slots.forEach(function(s) {
    const slot = document.querySelector(
      `.${s.type}-slot[data-team="${s.team}"][data-index="${s.index}"]`
    )
    if (!slot) return
    if (s.filled) {
      slot.innerHTML = s.innerHTML
      if (s.type === "ban") slot.classList.add("filled")
      else                  slot.classList.add("slot-filled")
    }
  })

  // Griser les champions utilisés et fearless
  state.usedChampions.forEach(function(id) {
    const card = document.querySelector(`.champ-card[data-id="${id}"]`)
    if (card) card.classList.add("champ-taken")
  })
  state.fearlessPool.forEach(function(id) {
    const card = document.querySelector(`.champ-card[data-id="${id}"]`)
    if (card) { card.classList.remove("champ-taken"); card.classList.add("champ-fearless") }
  })

  // Restaurer les noms d'équipe
  el("team-name-blue").value = saved.teamBlue || ""
  el("team-name-red").value  = saved.teamRed  || ""

  // Restaurer le bouton BO actif
  document.querySelectorAll(".bo-btn").forEach(function(btn) {
    btn.classList.toggle("active", parseInt(btn.dataset.bo) === state.seriesFormat)
  })

  // Restaurer le badge first pick
  if (state.sidesSwapped) {
    el("fp-blue").classList.add("hidden")
    el("fp-red").classList.remove("hidden")
  }

  highlightActiveSlot()
  renderTurnIndicator()
  renderGameDots()
  renderNextBtn()
  if (state.currentTurn > 0 || state.currentGame > 1) lockBO()
  if (state.currentTurn > 0 || state.currentGame > state.seriesFormat) lockControls()
}



// ============================================================
// UTILITAIRES
// ============================================================
function el(id) { return document.getElementById(id) }

function getPhaseKey(turn) {
  if (turn < 6)  return "phase1bans"
  if (turn < 12) return "phase1picks"
  if (turn < 16) return "phase2bans"
  return "phase2picks"
}

function getSlot(team, type, index) {
  return document.querySelector(`.${type}-slot[data-team="${team}"][data-index="${index}"]`)
}

// ============================================================
// RENDU : COMPTEUR DE GAMES
// ============================================================
function renderGameDots() {
  const container  = el("game-dots")
  const seriesOver = state.currentGame > state.seriesFormat
  container.innerHTML = ""
  for (let i = 1; i <= state.seriesFormat; i++) {
    const dot    = document.createElement("div")
    dot.className = "game-dot"
    const winner = state.wins[i - 1]
    if (winner) {
      // Game jouée avec un vainqueur enregistré
      dot.classList.add("done-" + winner)
    } else if (i < state.currentGame && !seriesOver) {
      // Game passée sans vainqueur enregistré (ne devrait pas arriver normalement)
      dot.classList.add("done")
    }
    if (i === state.currentGame && !seriesOver) dot.classList.add("current")
    container.appendChild(dot)
  }
  el("game-label").textContent = `${t("game")} ${Math.min(state.currentGame, state.seriesFormat)} / ${state.seriesFormat}`
}

// ============================================================
// RENDU : INDICATEUR DE TOUR
// ============================================================
function renderTurnIndicator() {
  const ind     = el("turn-indicator")
  const teamEl  = el("turn-team")
  const actEl   = el("turn-action")
  const phaseEl = el("turn-phase")

  if (state.currentGame > state.seriesFormat) {
    ind.className = "turn-indicator turn-done"
    teamEl.textContent  = t("seriesDone")
    actEl.className     = "turn-action action-done"
    actEl.textContent   = ""
    phaseEl.textContent = ""
    return
  }
  if (state.draftFinished) {
    ind.className = "turn-indicator turn-done"
    teamEl.textContent  = t("draftDone")
    actEl.className     = "turn-action action-done"
    actEl.textContent   = ""
    phaseEl.textContent = ""
    return
  }

  const step = DRAFT_ORDER[state.currentTurn]
  let displayTeam = state.sidesSwapped
    ? (step.team === "blue" ? "red" : "blue")
    : step.team

  const name = displayTeam === "blue" ? t("blueTeam") : t("redTeam")

  ind.className       = `turn-indicator turn-${displayTeam}`
  teamEl.textContent  = name
  actEl.className     = `turn-action action-${step.type}`
  actEl.textContent   = step.type.toUpperCase()
  phaseEl.textContent = t(getPhaseKey(state.currentTurn))
}

// ============================================================
// RENDU : SLOT ACTIF
// ============================================================
function highlightActiveSlot() {
  document.querySelectorAll(".pick-slot, .ban-slot").forEach(s => s.classList.remove("slot-active"))
  // Ne rien surligner si la draft est finie, la série terminée, ou le tour hors limites
  if (state.draftFinished) return
  if (state.currentGame > state.seriesFormat) return
  if (state.currentTurn >= DRAFT_ORDER.length) return
  const step    = DRAFT_ORDER[state.currentTurn]
  const domTeam = state.sidesSwapped ? (step.team === "blue" ? "red" : "blue") : step.team
  const slot    = getSlot(domTeam, step.type, step.index)
  if (slot) slot.classList.add("slot-active")
}

// ============================================================
// RENDU : BOUTON NEXT
// ============================================================
function renderNextBtn() {
  renderWinButtons()
  const seriesOver  = state.currentGame > state.seriesFormat
  const nothingDone = state.currentTurn === 0 && !state.draftFinished

  // Griser "Reset Picks/Bans" si série terminée ou rien encore fait
  const resetDisabled = seriesOver || nothingDone
  el("btn-reset").disabled            = resetDisabled
  el("btn-reset").style.opacity       = resetDisabled ? "0.35" : ""
  el("btn-reset").style.pointerEvents = resetDisabled ? "none"  : ""

  // Swap autorisé uniquement avant le 1er ban (turn 0, draft pas commencée, série pas finie)
  // Bloqué dès qu'un ban/pick a lieu, et après la fin de série
  const swapAllowed = !seriesOver
    && state.currentTurn === 0
    && !state.draftFinished
  el("btn-swap").disabled            = !swapAllowed
  el("btn-swap").style.opacity       = swapAllowed ? "" : "0.35"
  el("btn-swap").style.pointerEvents = swapAllowed ? "" : "none"

  // Griser "Reset Series" si rien n'a encore été fait du tout :
  // pas de picks/bans, pas de noms, pas de swap, pas de game 2+
  const blueNameSet   = (el("team-name-blue").value || "").trim() !== ""
  const redNameSet    = (el("team-name-red").value  || "").trim() !== ""
  const somethingDone = state.currentTurn > 0
    || state.draftFinished
    || state.currentGame > 1
    || state.sidesSwapped
    || blueNameSet
    || redNameSet
  el("btn-reset-series").disabled            = !somethingDone
  el("btn-reset-series").style.opacity       = !somethingDone ? "0.35" : ""
  el("btn-reset-series").style.pointerEvents = !somethingDone ? "none"  : ""
}

// ============================================================
// VERROUILLAGE
// ============================================================
function lockBO() {
  document.querySelectorAll(".bo-btn").forEach(b => b.disabled = true)
}
function unlockBO() {
  document.querySelectorAll(".bo-btn").forEach(b => b.disabled = false)
}
function lockControls() {
  lockBO()
  el("btn-swap").disabled = true
}
function unlockControls() {
  // Le swap est géré exclusivement par renderNextBtn()
}

// ============================================================
// FLASH DES BOUTONS DE VICTOIRE
// ============================================================
function flashWinButtons() {
  const blue = el("btn-win-blue")
  const red  = el("btn-win-red")
  blue.classList.remove("btn-flash")
  red.classList.remove("btn-flash")
  void blue.offsetWidth
  void red.offsetWidth
  blue.classList.add("btn-flash")
  red.classList.add("btn-flash")
  setTimeout(function() {
    blue.classList.remove("btn-flash")
    red.classList.remove("btn-flash")
  }, 1300)
}

// Flash du bouton "Reset série" quand la série est terminée
function flashResetSeries() {
  const btn = el("btn-reset-series")
  btn.classList.remove("btn-flash")
  void btn.offsetWidth
  btn.classList.add("btn-flash")
  setTimeout(function() { btn.classList.remove("btn-flash") }, 1300)
}

// ============================================================
// ASSIGNER UN CHAMPION
// ============================================================
function assignChampion(champion) {
  // Série terminée : flash le bouton reset série
  if (state.currentGame > state.seriesFormat) {
    flashResetSeries()
    return
  }
  // Draft finie et BO > 1 : flash les boutons de victoire
  if (state.draftFinished) {
    if (state.currentGame <= state.seriesFormat) {
      flashWinButtons()
    }
    return
  }
  if (state.usedChampions.has(champion.id)) return
  if (state.fearlessPool.has(champion.id)) return

  const step    = DRAFT_ORDER[state.currentTurn]
  const domTeam = state.sidesSwapped ? (step.team === "blue" ? "red" : "blue") : step.team
  const slot    = getSlot(domTeam, step.type, step.index)

  if (step.type === "ban") {
    slot.innerHTML = ""
    slot.classList.add("filled")
    const img = document.createElement("img")
    img.src = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champion.image.full}`
    img.alt = champion.name
    slot.appendChild(img)
  } else {
    slot.classList.add("slot-filled")
    slot.classList.remove("slot-active")
    slot.innerHTML = `
      <img class="slot-splash" src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg" alt="">
      <div class="slot-overlay"></div>
      <div class="slot-content">
        <img class="slot-icon" src="https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champion.image.full}" alt="${champion.name}">
        <div class="slot-info">
          <span class="slot-name">${champion.name}</span>
          <span class="slot-role">${slot.dataset.roleLabel || ""}</span>
        </div>
      </div>`
  }

  state.usedChampions.add(champion.id)
  lockControls()

  const card = document.querySelector(`.champ-card[data-id="${champion.id}"]`)
  if (card) card.classList.add("champ-taken")

  state.currentTurn++
  if (state.currentTurn >= DRAFT_ORDER.length) state.draftFinished = true

  highlightActiveSlot()
  renderTurnIndicator()
  renderNextBtn()
  markInteraction()
  saveState()
}

// ============================================================
// FILTRAGE
// ============================================================
function filterChampions() {
  const search = el("search-input").value.toLowerCase().trim()
  const role   = state.roleFilter
  document.querySelectorAll(".champ-card").forEach(function(card) {
    const nameOk = card.dataset.name.includes(search)
    // Si "all" → tout afficher, sinon vérifier le mapping de rôles
    const roleOk = role === "all" || getChampRoles(card.dataset.id).includes(role)
    card.classList.toggle("champ-hidden", !(nameOk && roleOk))
  })
}

// ============================================================
// RESET GAME
// ============================================================
function resetGame() {
  state.currentTurn    = 0
  state.usedChampions  = new Set()
  state.draftFinished  = false
  // NE PAS toucher : noms d'équipes, first pick, vainqueur des games précédentes

  document.querySelectorAll(".pick-slot").forEach(function(slot) {
    const role = slot.dataset.roleLabel || ""
    slot.className = "pick-slot"
    slot.innerHTML = `<div class="slot-content"><span class="slot-role-label">${role}</span></div>`
  })
  document.querySelectorAll(".ban-slot").forEach(function(slot) {
    slot.innerHTML = ""
    slot.className = "ban-slot"
    slot.dataset.team  && (slot.dataset.team = slot.dataset.team)
    slot.dataset.index && (slot.dataset.index = slot.dataset.index)
  })
  // Réassigner les data-attributes perdus
  document.querySelectorAll(".ban-slot").forEach(function(slot) {
    slot.classList.remove("filled", "slot-active")
  })

  document.querySelectorAll(".champ-card").forEach(c => c.classList.remove("champ-taken"))
  el("search-input").value = ""
  filterChampions()
  unlockControls()
  // Si on est en game 1, réactiver les boutons BO
  if (state.currentGame === 1) unlockBO()
  highlightActiveSlot()
  renderTurnIndicator()
  renderNextBtn()
  clearSave()
}

// ============================================================
// RESET SÉRIE
// ============================================================
function resetSeries(keepNames = false, keepSides = false) {
  state.currentGame  = 1
  state.wins         = []
  state.fearlessPool = new Set()
  if (!keepSides) {
    state.sidesSwapped = false
    el("fp-blue").classList.remove("hidden")
    el("fp-red").classList.add("hidden")
  }
  document.querySelectorAll(".champ-card").forEach(c => c.classList.remove("champ-fearless"))
  if (!keepNames) {
    el("team-name-blue").value = ""
    el("team-name-red").value  = ""
  }
  unlockBO()
  resetGame()
  renderGameDots()
}

// ============================================================
// ENREGISTRER LE VAINQUEUR ET PASSER À LA GAME SUIVANTE
// ============================================================
function recordWinAndNext(winner) {
  if (!state.draftFinished || state.currentGame > state.seriesFormat) return

  state.wins[state.currentGame - 1] = winner

  state.usedChampions.forEach(id => state.fearlessPool.add(id))
  state.fearlessPool.forEach(function(id) {
    const card = document.querySelector(`.champ-card[data-id="${id}"]`)
    if (card) { card.classList.remove("champ-taken"); card.classList.add("champ-fearless") }
  })

  state.currentGame++
  resetGame()
  renderGameDots()
  renderWinButtons()
  saveState()
}

// Affiche/masque les boutons de victoire
function renderWinButtons() {
  // Afficher les boutons de victoire pour TOUS les formats (y compris BO1)
  // dès que la draft est finie et qu'on n'est pas au-delà du max de games
  const show = state.draftFinished
    && state.currentGame <= state.seriesFormat

  el("btn-win-blue").style.display = show ? "inline-flex" : "none"
  el("btn-win-red").style.display  = show ? "inline-flex" : "none"
  el("btn-next").style.display     = "none"
}

// ============================================================
// SWAP
// ============================================================
function swapSides() {
  state.sidesSwapped = !state.sidesSwapped
  const fpBlue = el("fp-blue")
  const fpRed  = el("fp-red")
  if (state.sidesSwapped) { fpBlue.classList.add("hidden"); fpRed.classList.remove("hidden") }
  else                    { fpBlue.classList.remove("hidden"); fpRed.classList.add("hidden") }
  renderTurnIndicator()
  highlightActiveSlot()
}

// ============================================================
// CHARGEMENT DES CHAMPIONS
// ============================================================
async function loadChampions() {
  const res  = await fetch(URL_CHAMPS)
  const data = await res.json()
  const list = Object.values(data.data).sort((a, b) => a.name.localeCompare(b.name))
  const grid = el("champions-grid")

  list.forEach(function(champ) {
    const card = document.createElement("div")
    card.className    = "champ-card"
    card.dataset.id   = champ.id
    card.dataset.name = champ.name.toLowerCase()
    card.dataset.tags = champ.tags.map(t => t.toLowerCase()).join(",")

    const img = document.createElement("img")
    img.src     = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champ.image.full}`
    img.alt     = champ.name
    img.loading = "lazy"

    const span = document.createElement("span")
    span.textContent = champ.name

    card.appendChild(img)
    card.appendChild(span)
    grid.appendChild(card)
    card.addEventListener("click", () => assignChampion(champ))
  })

  highlightActiveSlot()
  renderTurnIndicator()
  renderGameDots()
  renderNextBtn()

  // Restaurer une draft sauvegardée si elle existe
  const raw = localStorage.getItem("draftforge_state")
  if (raw) {
    try {
      const saved = JSON.parse(raw)
      // Restaurer l'état
      state.seriesFormat  = saved.seriesFormat  ?? 3
      state.currentGame   = saved.currentGame   ?? 1
      state.wins          = saved.wins          ?? []
      state.fearlessPool  = new Set(saved.fearlessPool  ?? [])
      state.currentTurn   = saved.currentTurn   ?? 0
      state.usedChampions = new Set(saved.usedChampions ?? [])
      state.draftFinished = saved.draftFinished ?? false
      state.sidesSwapped  = saved.sidesSwapped  ?? false
      restoreVisuals(saved)
    } catch(e) {
      clearSave()
    }
  }
}

// ============================================================
// CALLBACK LANGUE (appelé par shared.js quand la langue change)
// ============================================================
function onLanguageChange() {
  state.lang = currentLang
  // Mettre à jour les placeholders des inputs de nom d'équipe
  document.querySelectorAll(".team-name-input").forEach(function(input) {
    input.placeholder = t(input.dataset.default)
  })
  renderTurnIndicator()
  renderGameDots()
}

// ============================================================
// INIT
// ============================================================
function init() {
  initNavbar()
  applyTranslations()

  // Placeholders des noms d'équipe
  document.querySelectorAll(".team-name-input").forEach(function(input) {
    input.placeholder = t(input.dataset.default)
    input.addEventListener("input", renderNextBtn)
  })

  // Boutons BO — verrouillés dès qu'une draft a commencé dans la série
  document.querySelectorAll(".bo-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      if (state.currentTurn > 0 || state.currentGame > 1) return
      const newFormat = parseInt(this.dataset.bo)
      // Si c'est déjà le BO actif, ne rien faire
      if (newFormat === state.seriesFormat) return
      state.seriesFormat = newFormat
      document.querySelectorAll(".bo-btn").forEach(b => b.classList.remove("active"))
      this.classList.add("active")
      resetSeries(true, true) // garder noms et first pick au changement de BO
    })
  })

  // Filtres rôle
  document.querySelectorAll(".role-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      state.roleFilter = this.dataset.role
      document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"))
      this.classList.add("active")
      filterChampions()
    })
  })

  el("btn-win-blue").addEventListener("click", function() { recordWinAndNext("blue") })
  el("btn-win-red").addEventListener("click",  function() { recordWinAndNext("red") })
  el("search-input").addEventListener("input", filterChampions)
  el("btn-swap").addEventListener("click", swapSides)

  el("btn-reset").addEventListener("click", resetGame)

  // Bouton reset série : popup seulement si la série n'est pas déjà terminée
  el("btn-reset-series").addEventListener("click", function() {
    // Pas de popup si la série est terminée (currentGame > seriesFormat)
    // car c'est le seul moyen de continuer
    if (state.currentGame > state.seriesFormat) {
      resetSeries()
      return
    }
    el("confirm-title").textContent = t("confirmResetTitle")
    el("confirm-msg").textContent   = t("confirmResetMsg")
    el("confirm-yes").textContent   = t("confirmResetYes")
    el("confirm-no").textContent    = t("confirmResetNo")
    el("confirm-overlay").classList.add("active")
  })

  // Popup : confirmer
  el("confirm-yes").addEventListener("click", function() {
    el("confirm-overlay").classList.remove("active")
    resetSeries()
  })
  // Popup : annuler
  el("confirm-no").addEventListener("click", function() {
    el("confirm-overlay").classList.remove("active")
  })
  // Fermer en cliquant sur l'overlay
  el("confirm-overlay").addEventListener("click", function(e) {
    if (e.target === this) this.classList.remove("active")
  })

  resolveVersion().then(loadChampions)
}

init()
