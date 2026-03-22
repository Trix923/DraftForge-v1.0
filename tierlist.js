// ============================================================
// CONFIGURATION
// ============================================================
const VERSIONS_URL_TL = "https://ddragon.leagueoflegends.com/api/versions.json"
let VERSION_TL = "14.24.1"
let URL_CHAMPS_TL = `https://ddragon.leagueoflegends.com/cdn/${VERSION_TL}/data/en_US/champion.json`

async function resolveVersionTL() {
  try {
    const res = await fetch(VERSIONS_URL_TL)
    const versions = await res.json()
    VERSION_TL = versions[0]
    URL_CHAMPS_TL = `https://ddragon.leagueoflegends.com/cdn/${VERSION_TL}/data/en_US/champion.json`
  } catch(e) {
    console.warn("Fallback version tierlist")
  }
}

const DEFAULT_TIERS = [
  { label: "S", color: "#e5a100" },
  { label: "A", color: "#3fa84a" },
  { label: "B", color: "#1a78c2" },
  { label: "C", color: "#7b4fce" },
  { label: "D", color: "#c23b1a" },
  { label: "E", color: "#5a3a1a" },
]

const PALETTE_COLORS = [
  "#e5a100","#f0c040","#3fa84a","#50c878",
  "#1a78c2","#5aabff","#7b4fce","#b07fff",
  "#c23b1a","#e85050","#c96aa0","#ff99cc",
  "#888888","#aaaaaa","#333355","#2a3a2a",
]

// ============================================================
// ÉTAT
// ============================================================
const tlState = {
  roleFilter:  "all",
  colorPopup:  null,
}

let tierCounter = 0
function newTierId() { return "tier-" + (++tierCounter) }
function newColId()  { return "col-"  + (++tierCounter) }

// ============================================================
// CRÉER UNE COLONNE dans un tier
// Une colonne est une zone de dépôt indépendante à l'intérieur
// d'un tier. On peut en avoir plusieurs côte à côte.
// ============================================================
function createColumn(tierDropArea, colId) {
  const col = document.createElement("div")
  col.className    = "tier-col"
  col.dataset.col  = colId

  // Événements drag & drop
  col.addEventListener("dragover",  onDragOver)
  col.addEventListener("dragleave", onDragLeave)
  col.addEventListener("drop", function(e) {
    e.preventDefault()
    this.classList.remove("drag-over")
    const champId = e.dataTransfer.getData("text/plain")
    const card    = document.querySelector(`.tl-champ[data-id="${champId}"]`)
    if (card) { this.appendChild(card); saveTLState() }
  })

  tierDropArea.appendChild(col)
  return col
}

// ============================================================
// CRÉER UN TIER
// ============================================================
function createTier(label, color) {
  const id  = newTierId()

  // Wrapper externe : contient la ligne + le bouton delete à droite
  const wrap = document.createElement("div")
  wrap.className    = "tier-row-wrap"
  wrap.dataset.tier = id

  const row = document.createElement("div")
  row.className    = "tier-row"
  row.dataset.tier = id

  // ---- Étiquette colorée ----
  const labelDiv = document.createElement("div")
  labelDiv.className  = "tier-label"
  labelDiv.style.background = color

  const labelInput = document.createElement("div")
  labelInput.className       = "tier-label-text"
  labelInput.contentEditable = "true"
  labelInput.textContent     = label
  labelInput.spellcheck      = false
  labelInput.addEventListener("input", saveTLState)

  const colorBtn = document.createElement("button")
  colorBtn.className = "tier-color-btn"
  colorBtn.title     = "Change color"
  colorBtn.addEventListener("click", function(e) {
    e.stopPropagation()
    openColorPalette(e, labelDiv, saveTLState)
  })

  labelDiv.appendChild(labelInput)
  labelDiv.appendChild(colorBtn)

  // ---- Zone des colonnes ----
  const dropArea = document.createElement("div")
  dropArea.className    = "tier-drop-area"
  dropArea.dataset.tier = id
  createColumn(dropArea, newColId())

  // ---- Bouton supprimer — à l'extérieur du rectangle ----
  const del = document.createElement("button")
  del.className   = "tier-delete"
  del.textContent = "×"
  del.title       = "Delete tier"
  del.addEventListener("click", function() {
    document.getElementById("tl-confirm-delete-title").textContent = t("tlConfirmDeleteTitle")
    document.getElementById("tl-confirm-delete-msg").textContent   = t("tlConfirmDeleteMsg")
    document.getElementById("tl-confirm-delete-yes").textContent   = t("confirmResetYes")
    document.getElementById("tl-confirm-delete-no").textContent    = t("confirmResetNo")
    const overlay = document.getElementById("tl-confirm-delete-overlay")
    overlay.classList.add("active")
    document.getElementById("tl-confirm-delete-yes").onclick = function() {
      overlay.classList.remove("active")
      dropArea.querySelectorAll(".tl-champ").forEach(function(card) {
        document.getElementById("tl-pool").appendChild(card)
      })
      wrap.remove()
      saveTLState()
    }
    document.getElementById("tl-confirm-delete-no").onclick = function() {
      overlay.classList.remove("active")
    }
  })

  row.appendChild(labelDiv)
  row.appendChild(dropArea)

  wrap.appendChild(row)
  wrap.appendChild(del)

  document.getElementById("tl-tiers").appendChild(wrap)
  return id
}

// ============================================================
// PALETTE DE COULEURS
// ============================================================
function openColorPalette(event, labelDiv, onchange) {
  if (tlState.colorPopup) { tlState.colorPopup.remove(); tlState.colorPopup = null }

  const popup = document.createElement("div")
  popup.className = "color-palette"

  PALETTE_COLORS.forEach(function(color) {
    const swatch = document.createElement("div")
    swatch.className        = "color-swatch"
    swatch.style.background = color
    swatch.addEventListener("click", function() {
      labelDiv.style.background = color
      popup.remove()
      tlState.colorPopup = null
      if (onchange) onchange()
    })
    popup.appendChild(swatch)
  })

  const rect = event.target.getBoundingClientRect()
  popup.style.top  = (rect.bottom + 6) + "px"
  popup.style.left = Math.max(8, rect.left - 80) + "px"
  document.body.appendChild(popup)
  tlState.colorPopup = popup

  setTimeout(function() {
    document.addEventListener("click", function close(e) {
      if (!popup.contains(e.target)) { popup.remove(); tlState.colorPopup = null }
      document.removeEventListener("click", close)
    })
  }, 10)
}

// ============================================================
// CARTES DE CHAMPIONS
// ============================================================
function createChampCard(champ) {
  const card = document.createElement("div")
  card.className      = "tl-champ"
  card.draggable      = true
  card.dataset.id     = champ.id
  card.dataset.name   = champ.name.toLowerCase()
  card.dataset.tags   = champ.tags.map(t => t.toLowerCase()).join(",")

  const img = document.createElement("img")
  img.src     = `https://ddragon.leagueoflegends.com/cdn/${VERSION_TL}/img/champion/${champ.image.full}`
  img.alt     = champ.name
  img.loading = "lazy"

  const span = document.createElement("span")
  span.textContent = champ.name

  card.appendChild(img)
  card.appendChild(span)

  card.addEventListener("dragstart", function(e) {
    card.classList.add("dragging")
    e.dataTransfer.setData("text/plain", champ.id)
    e.dataTransfer.effectAllowed = "move"
    // Si le champion vient d'un tier (pas du pool), teinter le pool en rouge
    if (!card.closest("#tl-pool")) {
      document.getElementById("tl-pool").classList.add("drag-remove")
    }
  })
  card.addEventListener("dragend", function() {
    card.classList.remove("dragging")
    document.getElementById("tl-pool").classList.remove("drag-remove")
  })

  return card
}

// ============================================================
// DRAG & DROP — handlers partagés
// ============================================================
function onDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = "move"
  this.classList.add("drag-over")
}

function onDragLeave(e) {
  if (!this.contains(e.relatedTarget)) this.classList.remove("drag-over")
}

// ============================================================
// FILTRAGE (recherche + rôle)
// ============================================================
function filterTLChampions() {
  const search = document.getElementById("tl-search").value.toLowerCase().trim()
  const role   = tlState.roleFilter
  document.querySelectorAll(".tl-champ").forEach(function(card) {
    const nameOk = card.dataset.name.includes(search)
    const roleOk = role === "all" || getChampRoles(card.dataset.id).includes(role)
    card.classList.toggle("tl-hidden", !(nameOk && roleOk))
  })
}

// ============================================================
// SAUVEGARDE / RESTAURATION (localStorage)
// ============================================================
const TL_SAVE_KEY = "draftforge_tl_state"

function updateTLResetBtn() {
  const anyInTier = !!document.querySelector("#tl-tiers .tl-champ")
  const btn = document.getElementById("tl-reset")
  btn.disabled            = !anyInTier
  btn.style.opacity       = anyInTier ? "" : "0.35"
  btn.style.pointerEvents = anyInTier ? "" : "none"
}

function saveTLState() {
  const tiers = []
  document.querySelectorAll(".tier-row").forEach(function(row) {
    const labelEl = row.querySelector(".tier-label-text")
    const labelDiv = row.querySelector(".tier-label")
    const columns = []
    row.querySelectorAll(".tier-col").forEach(function(col) {
      const champs = []
      col.querySelectorAll(".tl-champ").forEach(function(card) {
        champs.push(card.dataset.id)
      })
      columns.push(champs)
    })
    tiers.push({
      label:   labelEl ? labelEl.textContent : "?",
      color:   labelDiv ? labelDiv.style.background : "#445566",
      columns: columns,
    })
  })
  localStorage.setItem(TL_SAVE_KEY, JSON.stringify({ tiers }))
  markInteraction()
  updateTLResetBtn()
}

function restoreTLState() {
  const raw = localStorage.getItem(TL_SAVE_KEY)
  if (!raw) return false
  try {
    const saved = JSON.parse(raw)
    if (!saved.tiers || !saved.tiers.length) return false

    // Supprimer les tiers par défaut déjà créés
    document.getElementById("tl-tiers").innerHTML = ""

    saved.tiers.forEach(function(tierData) {
      const id = newTierId()

      const wrap = document.createElement("div")
      wrap.className    = "tier-row-wrap"
      wrap.dataset.tier = id

      const row = document.createElement("div")
      row.className    = "tier-row"
      row.dataset.tier = id

      const labelDiv = document.createElement("div")
      labelDiv.className        = "tier-label"
      labelDiv.style.background = tierData.color

      const labelInput = document.createElement("div")
      labelInput.className       = "tier-label-text"
      labelInput.contentEditable = "true"
      labelInput.textContent     = tierData.label
      labelInput.spellcheck      = false
      labelInput.addEventListener("input", saveTLState)

      const colorBtn = document.createElement("button")
      colorBtn.className = "tier-color-btn"
      colorBtn.title     = "Change color"
      colorBtn.addEventListener("click", function(e) {
        e.stopPropagation()
        openColorPalette(e, labelDiv, saveTLState)
      })

      labelDiv.appendChild(labelInput)
      labelDiv.appendChild(colorBtn)

      const dropArea = document.createElement("div")
      dropArea.className    = "tier-drop-area"
      dropArea.dataset.tier = id

      tierData.columns.forEach(function(champIds) {
        const col = createColumn(dropArea, newColId())
        champIds.forEach(function(champId) {
          const card = document.querySelector(`.tl-champ[data-id="${champId}"]`)
          if (card) col.appendChild(card)
        })
      })

      const del = document.createElement("button")
      del.className   = "tier-delete"
      del.textContent = "×"
      del.title       = "Delete tier"
      del.addEventListener("click", function() {
        document.getElementById("tl-confirm-delete-title").textContent = t("tlConfirmDeleteTitle")
        document.getElementById("tl-confirm-delete-msg").textContent   = t("tlConfirmDeleteMsg")
        document.getElementById("tl-confirm-delete-yes").textContent   = t("confirmResetYes")
        document.getElementById("tl-confirm-delete-no").textContent    = t("confirmResetNo")
        const overlay = document.getElementById("tl-confirm-delete-overlay")
        overlay.classList.add("active")
        document.getElementById("tl-confirm-delete-yes").onclick = function() {
          overlay.classList.remove("active")
          dropArea.querySelectorAll(".tl-champ").forEach(function(card) {
            document.getElementById("tl-pool").appendChild(card)
          })
          wrap.remove()
          saveTLState()
        }
        document.getElementById("tl-confirm-delete-no").onclick = function() {
          overlay.classList.remove("active")
        }
      })

      row.appendChild(labelDiv)
      row.appendChild(dropArea)
      wrap.appendChild(row)
      wrap.appendChild(del)
      document.getElementById("tl-tiers").appendChild(wrap)
    })
    return true
  } catch(e) {
    localStorage.removeItem(TL_SAVE_KEY)
    return false
  }
}


function resetTierList() {
  const pool = document.getElementById("tl-pool")
  document.querySelectorAll(".tier-col").forEach(function(col) {
    col.querySelectorAll(".tl-champ").forEach(function(card) {
      pool.appendChild(card)
    })
  })
}

// ============================================================
// CHARGEMENT DES CHAMPIONS
// ============================================================
async function loadTLChampions() {
  const res  = await fetch(URL_CHAMPS_TL)
  const data = await res.json()
  const list = Object.values(data.data).sort((a, b) => a.name.localeCompare(b.name))
  const pool = document.getElementById("tl-pool")
  list.forEach(function(champ) { pool.appendChild(createChampCard(champ)) })

  // Restaurer l'état sauvegardé une fois les champions en place
  restoreTLState()
  updateTLResetBtn()
}

// ============================================================
// CALLBACK LANGUE
// ============================================================
function onLanguageChange() { applyTranslations() }

// ============================================================
// INIT
// ============================================================
function initTierList() {
  initNavbar()
  applyTranslations()

  // Titre de la tier list
  const titleInput = document.getElementById("tl-title")
  titleInput.placeholder = t("tlTitlePlaceholder")
  titleInput.value = localStorage.getItem("draftforge_tl_title") || ""
  titleInput.addEventListener("input", function() {
    localStorage.setItem("draftforge_tl_title", this.value)
  })

  // Tiers par défaut
  DEFAULT_TIERS.forEach(function(tier) { createTier(tier.label, tier.color) })

  // Pool : zone de dépôt pour retirer un champion d'un tier
  const pool = document.getElementById("tl-pool")
  pool.addEventListener("dragover",  onDragOver)
  pool.addEventListener("dragleave", onDragLeave)
  pool.addEventListener("drop", function(e) {
    e.preventDefault()
    this.classList.remove("drag-over")
    const champId = e.dataTransfer.getData("text/plain")
    const card    = document.querySelector(`.tl-champ[data-id="${champId}"]`)
    if (card) { pool.appendChild(card); saveTLState() }
  })

  // Boutons de la toolbar
  document.getElementById("tl-add-tier").addEventListener("click", function() {
    createTier("?", "#445566")
    saveTLState()
  })

  // Reset avec popup de confirmation
  document.getElementById("tl-reset").addEventListener("click", function() {
    // Griser si aucun champion dans les tiers
    const anyInTier = !!document.querySelector("#tl-tiers .tl-champ")
    if (!anyInTier) return
    document.getElementById("tl-confirm-reset-title").textContent = t("tlConfirmResetTitle")
    document.getElementById("tl-confirm-reset-msg").textContent   = t("tlConfirmResetMsg")
    document.getElementById("tl-confirm-reset-yes").textContent   = t("confirmResetYes")
    document.getElementById("tl-confirm-reset-no").textContent    = t("confirmResetNo")
    document.getElementById("tl-confirm-reset-overlay").classList.add("active")
  })
  document.getElementById("tl-confirm-reset-yes").addEventListener("click", function() {
    document.getElementById("tl-confirm-reset-overlay").classList.remove("active")
    resetTierList(); saveTLState()
  })
  document.getElementById("tl-confirm-reset-no").addEventListener("click", function() {
    document.getElementById("tl-confirm-reset-overlay").classList.remove("active")
  })
  document.getElementById("tl-confirm-reset-overlay").addEventListener("click", function(e) {
    if (e.target === this) this.classList.remove("active")
  })


  // Recherche
  document.getElementById("tl-search").addEventListener("input", filterTLChampions)

  // Filtres rôle
  document.querySelectorAll("#tl-role-filters .role-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      tlState.roleFilter = this.dataset.role
      document.querySelectorAll("#tl-role-filters .role-btn")
        .forEach(function(b) { b.classList.remove("active") })
      this.classList.add("active")
      filterTLChampions()
    })
  })

  resolveVersionTL().then(loadTLChampions)
}

initTierList()
