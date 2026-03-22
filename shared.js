// ============================================================
// TRADUCTIONS
// Règle : chaque clé DOIT exister dans les 3 langues.
// Si une clé manque dans fr ou es, t() retourne la clé brute.
// ============================================================
const TRANSLATIONS = {
  en: {
    // Navbar
    navHome: "Home", navDraft: "Draft", navTierlist: "Tier List", navBoard: "Board", navChampions: "Champions",
    labelLang: "Language",
    // Accueil
    greeting:    "Welcome to DraftForge",
    greetingSub: "Simulate your drafts and rank your champions like a pro.",
    homeIntro:   "DraftForge is a free fan tool for League of Legends players. Prepare your drafts, build tier lists, and organize your strategies on an interactive map — all in one place.",
    homeDraftTitle: "Draft Simulator",
    homeDraftDesc:  "Simulate a full competitive draft in BO1, BO3 or BO5 format. Pick and ban champions turn by turn, track the series score, and prepare your strategy before the game.",
    homeDraftBtn:   "Go to Draft",
    homeTlTitle:    "Tier List Maker",
    homeTlDesc:     "Create a fully custom tier list of champions. Drag and drop champions into the tiers of your choice, rename and reorder them, and save your rankings automatically.",
    homeTlBtn:      "Go to Tier List",
    homeBoardTitle: "Strategy Board",
    homeBoardDesc:  "Place champion tokens directly on the Summoner's Rift map. Draw plays, annotate positions, and visualize your team compositions in a clear visual format.",
    homeBoardBtn:   "Go to Board",
    footerNote:  "Fan project — not affiliated with Riot Games.",
    footerSupport: "Support on",
    // Draft
    blueTeam: "Blue Team", redTeam: "Red Team",
    bans: "Bans", picks: "Picks", all: "All", firstPick: "First Pick",
    swapSides: "Swap First Pick", resetGame: "↺ Reset Picks/Bans", nextGame: "Next Game →", resetSeries: "↺ Reset Series",
    searchPlaceholder: "Search...",
    game: "Game",
    phase1bans: "Phase 1 — Bans", phase1picks: "Phase 1 — Picks",
    phase2bans: "Phase 2 — Bans", phase2picks: "Phase 2 — Picks",
    draftDone: "Draft completed", winBlue: "Blue wins", winRed: "Red wins", seriesDone: "Series over",
    // Tier list
    tlSearch: "Search...", tlExport: "Export image", tlReset: "↺ Reset champions",
    tlPool: "Available champions", tlAddTier: "+ Add tier", tlTitlePlaceholder: "Tier list title...",
    tlConfirmResetTitle: "Reset tier list?", tlConfirmResetMsg: "All champions will return to the pool.",
    tlConfirmDeleteTitle: "Delete this tier?", tlConfirmDeleteMsg: "Champions in this tier will return to the pool.",
    createdBy: "Created by", boardMapSR: "Summoner's Rift", boardMapARAM: "ARAM", boardUndo: "↩ Undo", boardRedo: "↪ Redo", boardClear: "Clear all", boardExport: "Export", boardChamps: "Champions", confirmClearTitle: "Clear the board?", confirmClearMsg: "This will erase all drawings and champions placed on the map.", confirmClearYes: "Yes, clear", confirmClearNo: "Cancel", champSearch: "Search a champion...", champSortName: "Name", champSortDiff: "Difficulty", champFilterAll: "All", champLore: "Lore", champStats: "Stats", champSpells: "Abilities", champPassive: "Passive", champTags: "Tags", champDiff: "Difficulty", champClose: "Close", confirmGameTitle: "Reset game?", confirmGameMsg: "This will reset the current game picks, team names and first pick.", confirmGameYes: "Yes, reset", confirmGameNo: "Cancel", confirmResetTitle: "Reset series?", confirmResetMsg: "This will clear the entire series, all picks and the fearless pool.", confirmResetYes: "Yes, reset", confirmResetNo: "Cancel",
  },
  fr: {
    navHome: "Accueil", navDraft: "Draft", navTierlist: "Tier List", navBoard: "Tableau", navChampions: "Champions",
    labelLang: "Langue",
    greeting:    "Bienvenue sur DraftForge",
    greetingSub: "Simulez vos drafts et classez vos champions comme un pro.",
    homeIntro:   "DraftForge est un outil fan gratuit pour les joueurs de League of Legends. Préparez vos drafts, construisez des tier lists et organisez vos stratégies sur une carte interactive — tout au même endroit.",
    homeDraftTitle: "Simulateur de Draft",
    homeDraftDesc:  "Simulez une draft compétitive complète en format BO1, BO3 ou BO5. Pickez et bannissez les champions tour par tour, suivez le score de la série et préparez votre stratégie avant la game.",
    homeDraftBtn:   "Aller à la Draft",
    homeTlTitle:    "Tier List Maker",
    homeTlDesc:     "Créez une tier list de champions entièrement personnalisée. Glissez-déposez les champions dans les tiers de votre choix, renommez-les, réorganisez-les, et vos classements sont sauvegardés automatiquement.",
    homeTlBtn:      "Aller à la Tier List",
    homeBoardTitle: "Tableau Stratégique",
    homeBoardDesc:  "Placez des vignettes de champions directement sur la carte de la Faille. Dessinez des déplacements, annotez des positions et visualisez vos compositions d'équipe de façon claire.",
    homeBoardBtn:   "Aller au Board",
    footerNote:  "Projet fan — non affilié à Riot Games.",
    footerSupport: "Soutenir sur",
    blueTeam: "Équipe Bleue", redTeam: "Équipe Rouge",
    bans: "Bans", picks: "Picks", all: "Tous", firstPick: "First Pick",
    swapSides: "Inverser First Pick", resetGame: "↺ Reset Picks/Bans", nextGame: "Game suivante →", resetSeries: "↺ Reset série",
    searchPlaceholder: "Rechercher...",
    game: "Game",
    phase1bans: "Phase 1 — Bans", phase1picks: "Phase 1 — Picks",
    phase2bans: "Phase 2 — Bans", phase2picks: "Phase 2 — Picks",
    draftDone: "Draft terminée", winBlue: "Victoire Bleue", winRed: "Victoire Rouge", seriesDone: "Série terminée",
    tlSearch: "Rechercher...", tlExport: "Exporter en image", tlReset: "↺ Reset champions",
    tlPool: "Champions disponibles", tlAddTier: "+ Ajouter un tier", tlTitlePlaceholder: "Titre de la tier list...",
    tlConfirmResetTitle: "Réinitialiser la tier list ?", tlConfirmResetMsg: "Tous les champions retourneront dans le pool.",
    tlConfirmDeleteTitle: "Supprimer ce tier ?", tlConfirmDeleteMsg: "Les champions de ce tier retourneront dans le pool.",
    createdBy: "Créé par", boardMapSR: "Summoner's Rift", boardMapARAM: "ARAM", boardUndo: "↩ Annuler", boardRedo: "↪ Rétablir", boardClear: "Tout effacer", boardExport: "Exporter", boardChamps: "Champions", confirmClearTitle: "Effacer le tableau ?", confirmClearMsg: "Cela effacera tous les dessins et champions placés sur la map.", confirmClearYes: "Oui, effacer", confirmClearNo: "Annuler", champSearch: "Rechercher un champion...", champSortName: "Nom", champSortDiff: "Difficulté", champFilterAll: "Tous", champLore: "Lore", champStats: "Stats", champSpells: "Capacités", champPassive: "Passif", champTags: "Tags", champDiff: "Difficulté", champClose: "Fermer", confirmGameTitle: "Réinitialiser la game ?", confirmGameMsg: "Cela réinitialisera les picks, les noms d'équipes et le first pick de la game.", confirmGameYes: "Oui, réinitialiser", confirmGameNo: "Annuler", confirmResetTitle: "Réinitialiser la série ?", confirmResetMsg: "Cela effacera toute la série, les picks et le fearless pool.", confirmResetYes: "Oui, réinitialiser", confirmResetNo: "Annuler",
  },
  es: {
    navHome: "Inicio", navDraft: "Draft", navTierlist: "Tier List", navBoard: "Tablero", navChampions: "Campeones",
    labelLang: "Idioma",
    greeting:    "Bienvenido a DraftForge",
    greetingSub: "Simula tus drafts y clasifica tus campeones como un pro.",
    homeIntro:   "DraftForge es una herramienta fan gratuita para jugadores de League of Legends. Prepara tus drafts, crea tier lists y organiza tus estrategias en un mapa interactivo — todo en un solo lugar.",
    homeDraftTitle: "Simulador de Draft",
    homeDraftDesc:  "Simula un draft competitivo completo en formato BO1, BO3 o BO5. Elige y banea campeones turno a turno, sigue el marcador de la serie y prepara tu estrategia antes de la partida.",
    homeDraftBtn:   "Ir al Draft",
    homeTlTitle:    "Tier List Maker",
    homeTlDesc:     "Crea una tier list de campeones totalmente personalizada. Arrastra y suelta campeones en los tiers que prefieras, renómbralos y reordénalos, con guardado automático.",
    homeTlBtn:      "Ir a Tier List",
    homeBoardTitle: "Tablero Estratégico",
    homeBoardDesc:  "Coloca fichas de campeones directamente en el mapa de la Grieta. Dibuja jugadas, anota posiciones y visualiza tus composiciones de equipo de forma clara.",
    homeBoardBtn:   "Ir al Board",
    footerNote:  "Proyecto fan — no afiliado a Riot Games.",
    footerSupport: "Apoyar en",
    blueTeam: "Equipo Azul", redTeam: "Equipo Rojo",
    bans: "Bans", picks: "Picks", all: "Todos", firstPick: "First Pick",
    swapSides: "Cambiar First Pick", resetGame: "↺ Reset Picks/Bans", nextGame: "Siguiente →", resetSeries: "↺ Reset serie",
    searchPlaceholder: "Buscar...",
    game: "Partida",
    phase1bans: "Fase 1 — Bans", phase1picks: "Fase 1 — Picks",
    phase2bans: "Fase 2 — Bans", phase2picks: "Fase 2 — Picks",
    draftDone: "Draft terminado", winBlue: "Gana Azul", winRed: "Gana Rojo", seriesDone: "Serie terminada",
    tlSearch: "Buscar...", tlExport: "Exportar imagen", tlReset: "↺ Reset champions",
    tlPool: "Campeones disponibles", tlAddTier: "+ Añadir tier", tlTitlePlaceholder: "Título de la tier list...",
    tlConfirmResetTitle: "¿Reiniciar la tier list?", tlConfirmResetMsg: "Todos los campeones volverán al pool.",
    tlConfirmDeleteTitle: "¿Eliminar este tier?", tlConfirmDeleteMsg: "Los campeones de este tier volverán al pool.",
    createdBy: "Creado por", boardMapSR: "Summoner's Rift", boardMapARAM: "ARAM", boardUndo: "↩ Deshacer", boardRedo: "↪ Rehacer", boardClear: "Borrar todo", boardExport: "Exportar", boardChamps: "Campeones", confirmClearTitle: "¿Borrar el tablero?", confirmClearMsg: "Esto borrará todos los dibujos y campeones del mapa.", confirmClearYes: "Sí, borrar", confirmClearNo: "Cancelar", champSearch: "Buscar un campeón...", champSortName: "Nombre", champSortDiff: "Dificultad", champFilterAll: "Todos", champLore: "Lore", champStats: "Stats", champSpells: "Habilidades", champPassive: "Pasiva", champTags: "Tags", champDiff: "Dificultad", champClose: "Cerrar", confirmGameTitle: "¿Reiniciar la partida?", confirmGameMsg: "Esto reiniciará los picks, nombres y el first pick de la partida.", confirmGameYes: "Sí, reiniciar", confirmGameNo: "Cancelar", confirmResetTitle: "¿Reiniciar la serie?", confirmResetMsg: "Esto borrará toda la serie, los picks y el fearless pool.", confirmResetYes: "Sí, reiniciar", confirmResetNo: "Cancelar",
  }
}

// ============================================================
// MAPPING CHAMPION → RÔLES DE JEU
// Source : rôles principaux dans le client LoL (patch 14.x)
// Un champion peut avoir plusieurs rôles.
// Clés : "top", "jungle", "mid", "adc", "support"
// ============================================================
const CHAMPION_ROLES = {
  Aatrox:       ["top"],
  Ahri:         ["mid"],
  Akali:        ["mid","top"],
  Akshan:       ["mid","top"],
  Alistar:      ["support"],
  Ambessa:      ["top","mid"],
  Amumu:        ["jungle","support"],
  Anivia:       ["mid"],
  Annie:        ["mid","support"],
  Aphelios:     ["adc"],
  Ashe:         ["adc","support"],
  AurelionSol:  ["mid"],
  Aurora:       ["mid","top"],
  Azir:         ["mid"],
  Bard:         ["support"],
  BelVeth:      ["jungle"],
  Blitzcrank:   ["support"],
  Brand:        ["support","mid"],
  Braum:        ["support"],
  Briar:        ["jungle"],
  Caitlyn:      ["adc"],
  Camille:      ["top"],
  Cassiopeia:   ["mid"],
  ChoGath:      ["top","support"],
  Corki:        ["mid"],
  Darius:       ["top"],
  Diana:        ["jungle","mid"],
  Draven:       ["adc"],
  DrMundo:      ["top","jungle"],
  Ekko:         ["jungle","mid"],
  Elise:        ["jungle"],
  Evelynn:      ["jungle"],
  Ezreal:       ["adc","mid"],
  Fiddlesticks: ["jungle","support"],
  Fiora:        ["top"],
  Fizz:         ["mid"],
  Galio:        ["mid","support"],
  Gangplank:    ["top"],
  Garen:        ["top"],
  Gnar:         ["top"],
  Gragas:       ["jungle","top","support"],
  Graves:       ["jungle"],
  Gwen:         ["top","jungle"],
  Hecarim:      ["jungle"],
  Heimerdinger: ["mid","top","support"],
  Hwei:         ["mid","support"],
  Illaoi:       ["top"],
  Irelia:       ["top","mid"],
  Ivern:        ["jungle"],
  Janna:        ["support"],
  JarvanIV:     ["jungle"],
  Jax:          ["top","jungle"],
  Jayce:        ["top","mid"],
  Jhin:         ["adc"],
  Jinx:         ["adc"],
  KaiSa:        ["adc"],
  Kalista:      ["adc"],
  Karma:        ["support","mid","top"],
  Karthus:      ["jungle","mid","adc"],
  Kassadin:     ["mid"],
  Katarina:     ["mid"],
  Kayle:        ["top","mid"],
  Kayn:         ["jungle"],
  Kennen:       ["top"],
  KhaZix:       ["jungle"],
  Kindred:      ["jungle"],
  Kled:         ["top"],
  KogMaw:       ["adc"],
  KSante:       ["top"],
  LeBlanc:      ["mid"],
  LeeSin:       ["jungle"],
  Leona:        ["support"],
  Lillia:       ["jungle"],
  Lissandra:    ["mid","top"],
  Lucian:       ["adc","mid"],
  Lulu:         ["support","top"],
  Lux:          ["support","mid"],
  Malphite:     ["top","support"],
  Malzahar:     ["mid"],
  Maokai:       ["support","top","jungle"],
  MasterYi:     ["jungle"],
  Mel:          ["mid"],
  MissFortune:  ["adc"],
  Mordekaiser:  ["top","mid"],
  Morgana:      ["support","mid"],
  Naafiri:      ["mid"],
  Nami:         ["support"],
  Nasus:        ["top"],
  Nautilus:     ["support"],
  Neeko:        ["mid","support"],
  Nidalee:      ["jungle"],
  Nilah:        ["adc"],
  Nocturne:     ["jungle","mid"],
  NunuWillump:  ["jungle"],
  Olaf:         ["jungle","top"],
  Orianna:      ["mid"],
  Ornn:         ["top"],
  Pantheon:     ["support","top","mid","jungle"],
  Poppy:        ["top","support","jungle"],
  Pyke:         ["support"],
  Qiyana:       ["mid","jungle"],
  Quinn:        ["top"],
  Rakan:        ["support"],
  RekSai:       ["jungle"],
  Rell:         ["support"],
  Renata:       ["support"],
  Renekton:     ["top"],
  Rengar:       ["jungle","top"],
  Riven:        ["top"],
  Rumble:       ["top","mid"],
  Ryze:         ["mid","top"],
  Samira:       ["adc"],
  Sejuani:      ["jungle"],
  Senna:        ["support","adc"],
  Seraphine:    ["support","mid"],
  Sett:         ["top","support"],
  Shaco:        ["jungle","support"],
  Shen:         ["top"],
  Shyvana:      ["jungle"],
  Singed:       ["top"],
  Sion:         ["top","support"],
  Sivir:        ["adc"],
  Skarner:      ["jungle"],
  Smolder:      ["adc","mid"],
  Sona:         ["support"],
  Soraka:       ["support"],
  Swain:        ["support","mid","top"],
  Sylas:        ["mid","jungle"],
  Syndra:       ["mid"],
  TahmKench:    ["support","top"],
  Taliyah:      ["jungle","mid"],
  Talon:        ["mid","jungle"],
  Taric:        ["support"],
  Teemo:        ["top"],
  Thresh:       ["support"],
  Tristana:     ["adc","mid"],
  Trundle:      ["jungle","top","support"],
  Tryndamere:   ["top","jungle"],
  TwistedFate:  ["mid"],
  Twitch:       ["adc","support"],
  Udyr:         ["jungle","top"],
  Urgot:        ["top"],
  Varus:        ["adc","mid"],
  Vayne:        ["adc","top"],
  Veigar:       ["mid","support"],
  VelKoz:       ["support","mid"],
  Vex:          ["mid"],
  Vi:           ["jungle"],
  Viego:        ["jungle"],
  Viktor:       ["mid"],
  Vladimir:     ["top","mid"],
  Volibear:     ["top","jungle"],
  Warwick:      ["jungle","top"],
  Wukong:       ["jungle","top"],
  Xayah:        ["adc"],
  Xerath:       ["support","mid"],
  XinZhao:      ["jungle"],
  Yasuo:        ["mid","top"],
  Yone:         ["mid","top"],
  Yorick:       ["top"],
  Yuumi:        ["support"],
  Zac:          ["jungle"],
  Zed:          ["mid","jungle"],
  Zeri:         ["adc"],
  Ziggs:        ["adc","mid"],
  Zilean:       ["support","mid"],
  ZileanSupport:["support"],
  Zoe:          ["mid"],
  Zyra:         ["support","mid"],
}

// Retourne les rôles d'un champion (tableau), [] si inconnu
function getChampRoles(championId) {
  return CHAMPION_ROLES[championId] || []
}


// localStorage garde le choix entre les pages
// ============================================================
let currentLang = localStorage.getItem("lang") || "en"

function t(key) { return (TRANSLATIONS[currentLang] || TRANSLATIONS.en)[key] || key }

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    // Les boutons de thème contiennent seulement du texte (la pastille
    // est un ::before CSS) → on peut utiliser textContent directement.
    // Les autres éléments (nav-link, span, etc.) aussi.
    // On exclut uniquement les lang-btn qui ont des <img> enfants.
    if (!el.classList.contains("lang-btn")) {
      el.textContent = t(el.dataset.i18n)
    }
  })
  document.querySelectorAll("[data-i18n-ph]").forEach(function(el) {
    el.placeholder = t(el.dataset.i18nPh)
  })
}

function setLanguage(lang) {
  currentLang = lang
  localStorage.setItem("lang", lang)
  document.querySelectorAll(".lang-btn").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.lang === lang)
  })
  applyTranslations()
  if (typeof onLanguageChange === "function") onLanguageChange()
}


// ============================================================
// THÈME
// On stocke le thème dans localStorage et on l'applique
// via l'attribut data-theme sur l'élément <html>.
// ============================================================
let currentTheme = localStorage.getItem("theme") || "warm"

function applyTheme(theme) {
  currentTheme = theme
  localStorage.setItem("theme", theme)
  // warm est le thème par défaut : pas d'attribut data-theme
  if (theme === "warm") {
    document.documentElement.removeAttribute("data-theme")
  } else {
    document.documentElement.setAttribute("data-theme", theme)
  }
  document.querySelectorAll(".theme-btn").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.theme === theme)
  })
}

function setTheme(theme) {
  applyTheme(theme)
  if (typeof onThemeChange === "function") onThemeChange()
}


// ============================================================
// INIT NAVBAR (appelé par chaque page)
// ============================================================
function initNavbar() {
  // Thème sauvegardé
  applyTheme(currentTheme)

  // Langue sauvegardée
  document.querySelectorAll(".lang-btn").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.lang === currentLang)
    btn.addEventListener("click", function() { setLanguage(this.dataset.lang) })
  })

  // Boutons de thème
  document.querySelectorAll(".theme-btn").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.theme === currentTheme)
    btn.addEventListener("click", function() { setTheme(this.dataset.theme) })
  })

  // Lien actif selon la page courante
  const page = window.location.pathname.split("/").pop() || "index.html"
  document.querySelectorAll(".nav-link").forEach(function(link) {
    link.classList.toggle("active", link.getAttribute("href") === page)
  })
}


// ============================================================
// AVERTISSEMENT AVANT RECHARGEMENT / FERMETURE
// Pas de popup si on navigue entre les pages du site.
// ============================================================
let _hasInteracted = false
let _navigatingInternally = false

function markInteraction() { _hasInteracted = true }

// Détecter les clics sur les liens internes du site
document.addEventListener("click", function(e) {
  const link = e.target.closest("a[href]")
  if (link) {
    const href = link.getAttribute("href")
    if (href && !href.startsWith("http") && link.target !== "_blank") {
      _navigatingInternally = true
    }
  }
})

window.addEventListener("beforeunload", function(e) {
  // Pas de popup si navigation interne (changement d'onglet du site)
  if (_navigatingInternally) return

  const draftSave = localStorage.getItem("draftforge_state")
  const boardSave = localStorage.getItem("draftforge_board")
  const tlTitle   = localStorage.getItem("draftforge_tl_title")

  // Pas de popup si le site est "vide"
  if (!_hasInteracted && !draftSave && !boardSave && !tlTitle) return

  // Effacer la draft, la tier list et le board — ils repartent à zéro au prochain chargement
  localStorage.removeItem("draftforge_state")
  localStorage.removeItem("draftforge_tl_state")
  localStorage.removeItem("draftforge_tl_title")
  localStorage.removeItem("draftforge_board")
  localStorage.removeItem("draftforge_tl_title")

  e.preventDefault()
  e.returnValue = ""
})
