// ═══════════════════════════════════════════════════════════
//  ΟΔΟ ΣΟΚΡΑΤΗΣ — game.js
//  Save system: localStorage key "sokrates_save"
//  Bug fix: completing a domain no longer increments G.floor
// ═══════════════════════════════════════════════════════════

// ── STATIC DATA ─────────────────────────────────────────────
const QUOTES = [
  '"So di non sapere nulla." — Socrate',
  '"La vita non esaminata non vale la pena di essere vissuta." — Socrate',
  '"Conosci te stesso." — Iscrizione di Delfi',
  '"La virtù è sapere." — Socrate',
  '"Il corpo è la prigione dell\'anima." — Platone',
  '"La filosofia è preparazione alla morte." — Socrate',
  '"Solo chi conosce i propri limiti può superarli." — Socrate',
  '"L\'ignoranza è la radice di ogni male." — Platone',
];

const ENEMIES = [
  {name:"Malloc",title:"The big M",icon:"🎭"},
  {name:"Francesco Bego",title:"Larper",icon:"🌀"},
  {name:"Lo Scheletro",title:"Portatore di invezioni",icon:"💀"},
  {name:"Barchi gay",title:"Apostolo delle j",icon:"👑"},
  {name:"Daniel",title:"Italian Master",icon:"⚖"},
  {name:"Zanotti",title:"Aura Farmer",icon:"🗡"},
  {name:"Redi",title:"Negative aura holder",icon:"🦁"},
  {name:"Il Trapezzoide",title:"I love trapezzoidi",icon:"🌑"},
  {name:"Basquiat",title:"IShowSpeed dei poveri",icon:"⛓"},
  {name:"Giatti",title:"Re dell'aura",icon:"🕳"},
  {name:"Denis Penis",title:"Fortnite Player",icon:"👁"},
  {name:"Il Bocchins",title:"Fa i bocchins",icon:"🔱"},
];

const DOMAIN_ENEMIES = {
  d1:[
    {name:"Gorgia l'Oratore",title:"Campione della Retorica",icon:"🎭"},
    {name:"Protagora il Relativista",title:"Uomo misura di tutte le cose",icon:"⚖"},
    {name:"Crizia il Tiranno",title:"Oligarca di Atene",icon:"👑"},
    {name:"Meleto l'Accusatore",title:"Nemico di Socrate",icon:"📜"},
    {name:"Anito il Demagogo",title:"Custode dell'Ignoranza",icon:"🌑"},
  ],
  d2:[
    {name:"L'Ombra della Caverna",title:"Prigioniero delle Illusioni",icon:"🕳"},
    {name:"La Forma Corrotta",title:"Idea Distorta",icon:"💀"},
    {name:"Il Demiurgo Oscuro",title:"Creatore di Menzogna",icon:"🌀"},
    {name:"Il Filosofo Falso",title:"Sofista in Toga",icon:"🎓"},
    {name:"L'Ombra di Platone",title:"Eco senza Sostanza",icon:"👻"},
  ],
  d3:[
    {name:"Il Tiranno dell'Etica",title:"Corruttore della Virtù",icon:"🗡"},
    {name:"Il Vizio Incarnato",title:"Nemico della Temperanza",icon:"🍷"},
    {name:"L'Ingiusto Supremo",title:"Avversario di Aristotele",icon:"⛓"},
    {name:"Il Nichilista",title:"Negatore di Ogni Valore",icon:"🌑"},
    {name:"Anassimandro il Caos",title:"Guardiano del Disordine",icon:"🔥"},
  ],
  d4:[
    {name:"Ade delle Idee",title:"Signore dell'Oblio",icon:"💀"},
    {name:"Titano dell'Ignoranza",title:"Antagonista degli Dei",icon:"🏔"},
    {name:"Erebo Filosofico",title:"Oscurità dell'Intelletto",icon:"🌑"},
    {name:"Il Vuoto Assoluto",title:"Antitesi della Sapienza",icon:"🕳"},
    {name:"Kronos dell'Oblio",title:"Divoratore di Saggezza",icon:"⌛"},
  ],
};

const SETS = {
  socratic_order:{id:'socratic_order',name:"Ordine Socratico",domain:1,icon:"🏛",color:"var(--s1)",
    desc2:"+15% Danno base",desc4:"Aporia infligge +80% danni",
    bonus2:{atkPct:.15},bonus4:{},bonus4special:'aporiaBoost'},
  sophist_mask:{id:'sophist_mask',name:"Maschera del Sofista",domain:1,icon:"🎭",color:"var(--s1)",
    desc2:"+22% HP Massimi",desc4:"Maieutica cura il 38% HP max",
    bonus2:{maxHpPct:.22},bonus4:{},bonus4special:'maieuticaBoost'},
  academy_mind:{id:'academy_mind',name:"Mente dell'Accademia",domain:2,icon:"📚",color:"var(--s2)",
    desc2:"+25% Logos Massimo",desc4:"Eironeia dura 6 turni, -70% ATK",
    bonus2:{maxMpPct:.25},bonus4:{},bonus4special:'eironeiaBuff'},
  ideal_form:{id:'ideal_form',name:"Forma delle Idee",domain:2,icon:"💎",color:"var(--s2)",
    desc2:"+12% Critico",desc4:"Colpi critici ×3.5 invece di ×2.2",
    bonus2:{critChancePct:.12},bonus4:{},bonus4special:'critMult'},
  nicomachean:{id:'nicomachean',name:"Etica Nicomachea",domain:3,icon:"⚖",color:"var(--s3)",
    desc2:"+15% ATK e DEF",desc4:"Vittoria → ripristino +30% HP",
    bonus2:{atkPct:.15,defPct:.15},bonus4:{},bonus4special:'victoryHeal'},
  pure_logic:{id:'pure_logic',name:"Logica Pura",domain:3,icon:"🔬",color:"var(--s3)",
    desc2:"+22% Difesa",desc4:"Rigenera 3% HP ogni turno nemico",
    bonus2:{defPct:.22},bonus4:{},bonus4special:'turnRegen'},
  prometheus_fire:{id:'prometheus_fire',name:"Fuoco di Prometeo",domain:4,icon:"🔥",color:"var(--s4)",
    desc2:"+20% Critico",desc4:"Elenchos colpisce 2 volte",
    bonus2:{critChancePct:.20},bonus4:{},bonus4special:'elenchosDouble'},
  divine_wisdom:{id:'divine_wisdom',name:"Saggezza degli Dei",domain:4,icon:"✨",color:"var(--s4)",
    desc2:"+35% Saggezza guadagnata",desc4:"Logos +5 dopo ogni tuo attacco",
    bonus2:{wisdomPct:.35},bonus4:{},bonus4special:'logosAttackRegen'},
};

const DOMAINS = [
  {id:1,name:"Agorà di Atene",icon:"🏛",color:"var(--s1)",bg:"rgba(201,168,76,.08)",
   desc:"Le strade di Atene. Nemici eloquenti e retori ingannatori.",
   sets:['socratic_order','sophist_mask'],enemyKey:'d1',scaleMult:1.0},
  {id:2,name:"Accademia di Platone",icon:"📚",color:"var(--s2)",bg:"rgba(80,144,208,.08)",
   desc:"I giardini dell'Accademia. Forme corrotte e ombre filosofiche.",
   sets:['academy_mind','ideal_form'],enemyKey:'d2',scaleMult:1.4},
  {id:3,name:"Liceo di Aristotele",icon:"⚖",color:"var(--s3)",bg:"rgba(90,170,90,.08)",
   desc:"Il Liceo peripatetico. Vizi e nichilisti dell'etica.",
   sets:['nicomachean','pure_logic'],enemyKey:'d3',scaleMult:2.0},
  {id:4,name:"Olimpo degli Dei",icon:"🔥",color:"var(--s4)",bg:"rgba(160,128,208,.08)",
   desc:"Le vette divine. Titani dell'oblio e guardiani del caos.",
   sets:['prometheus_fire','divine_wisdom'],enemyKey:'d4',scaleMult:3.0},
];

const SLOT_ICONS  = {weapon:"⚔",armor:"🛡",ring:"💍",amulet:"📿",boots:"👟"};
const SLOT_NAMES  = {weapon:"Arma",armor:"Armatura",ring:"Anello",amulet:"Amuleto",boots:"Sandali"};
const RARITY_ORDER= {common:0,uncommon:1,rare:2,legendary:3};
const RARITY_NAMES= {common:"Comune",uncommon:"Non Comune",rare:"Raro",legendary:"Leggendario"};
const SELL_PRICES = {common:3,uncommon:9,rare:25,legendary:60};
const DOMAIN_COST = 200;

const UPGRADES_DEF = [
  {id:'dialectics', name:'Dialettica',   desc:'+3 danno/lv.',        baseCost:15, effect:g=>{g.player.baseAtk+=3},            getEffect:lv=>`+${lv*3} ATK`,               costScale:1.5},
  {id:'virtue',     name:'Virtù',        desc:'+20 HP/lv.',          baseCost:20, effect:g=>{g.player.baseMaxHp+=20},          getEffect:lv=>`+${lv*20} HP`,               costScale:1.6},
  {id:'temperance', name:'Temperanza',   desc:'+2 def/lv.',          baseCost:25, effect:g=>{g.player.baseDef+=2},             getEffect:lv=>`+${lv*2} DEF`,               costScale:1.55},
  {id:'logos',      name:'Logos',        desc:'+10 Logos/lv.',       baseCost:18, effect:g=>{g.player.baseMaxMp+=10;g.player.baseMpRegen+=1}, getEffect:lv=>`+${lv*10} Logos`, costScale:1.45},
  {id:'insight',    name:'Intuizione',   desc:'+3% crit/lv.',        baseCost:30, effect:g=>{g.player.baseCritChance+=3},      getEffect:lv=>`+${lv*3}% Crit`,            costScale:1.6},
  {id:'wisdom_gain',name:'Sapienza',     desc:'+20% Saggezza/lv.',   baseCost:40, effect:g=>{g.wisdomMult+=0.2},               getEffect:lv=>`+${Math.round(lv*20)}% Sag.`,costScale:1.8},
];

// ── ITEMS DATABASE ───────────────────────────────────────────
const ITEMS_DB = buildItemsDB();

function buildItemsDB() {
  const W = [
    {n:"Rotolo della Dialettica",i:"📜",r:"common",   s:{atk:5},              sid:"socratic_order"},
    {n:"Scettro del Logos",      i:"🔱",r:"uncommon", s:{atk:9,critChance:2}, sid:"socratic_order"},
    {n:"Spada della Verità",     i:"⚔", r:"rare",     s:{atk:16,critChance:5},sid:"socratic_order"},
    {n:"Lama dell'Elenchos",     i:"🗡",r:"legendary",s:{atk:28,critChance:10},sid:"socratic_order"},
    {n:"Bastone Sofistico",      i:"🪄",r:"common",   s:{atk:4,maxHp:15},     sid:"sophist_mask"},
    {n:"Lira dell'Inganno",      i:"🎵",r:"uncommon", s:{atk:7,maxHp:30},     sid:"sophist_mask"},
    {n:"Asta del Retore",        i:"📏",r:"rare",     s:{atk:12,maxHp:55},    sid:"sophist_mask"},
    {n:"Fiamma Sofistica",       i:"🔥",r:"legendary",s:{atk:20,maxHp:90},    sid:"sophist_mask"},
    {n:"Penna dell'Accademia",   i:"✒", r:"common",   s:{atk:4,maxMp:12},     sid:"academy_mind"},
    {n:"Calamo Platonico",       i:"🖊",r:"uncommon", s:{atk:7,maxMp:22},     sid:"academy_mind"},
    {n:"Libro delle Forme",      i:"📖",r:"rare",     s:{atk:11,maxMp:38},    sid:"academy_mind"},
    {n:"Dialogo Infinito",       i:"💬",r:"legendary",s:{atk:18,maxMp:60},    sid:"academy_mind"},
    {n:"Cristallo dell'Idea",    i:"💎",r:"common",   s:{atk:4,critChance:4}, sid:"ideal_form"},
    {n:"Lama di Cristallo",      i:"🔮",r:"uncommon", s:{atk:8,critChance:7}, sid:"ideal_form"},
    {n:"Spada dell'Eterno",      i:"⚡",r:"rare",     s:{atk:14,critChance:11},sid:"ideal_form"},
    {n:"Forma Assoluta",         i:"🌟",r:"legendary",s:{atk:24,critChance:18},sid:"ideal_form"},
    {n:"Spadino Etico",          i:"🗡",r:"common",   s:{atk:5,def:3},        sid:"nicomachean"},
    {n:"Ascia della Virtù",      i:"🪓",r:"uncommon", s:{atk:9,def:5},        sid:"nicomachean"},
    {n:"Spada dell'Etica",       i:"⚔", r:"rare",     s:{atk:15,def:8},       sid:"nicomachean"},
    {n:"Lama Nicomachea",        i:"🔱",r:"legendary",s:{atk:26,def:13},      sid:"nicomachean"},
    {n:"Compasso Logico",        i:"📐",r:"common",   s:{atk:3,def:5},        sid:"pure_logic"},
    {n:"Righello della Ragione", i:"📏",r:"uncommon", s:{atk:6,def:8},        sid:"pure_logic"},
    {n:"Assioma Affilato",       i:"🔬",r:"rare",     s:{atk:10,def:13},      sid:"pure_logic"},
    {n:"Teorema Assoluto",       i:"∞", r:"legendary",s:{atk:16,def:22},      sid:"pure_logic"},
    {n:"Tizzone di Prometeo",    i:"🕯",r:"common",   s:{atk:5,critChance:5}, sid:"prometheus_fire"},
    {n:"Torcia Olimpica",        i:"🔦",r:"uncommon", s:{atk:9,critChance:9}, sid:"prometheus_fire"},
    {n:"Fiamma Divina",          i:"🔥",r:"rare",     s:{atk:16,critChance:14},sid:"prometheus_fire"},
    {n:"Braciere degli Dei",     i:"☄", r:"legendary",s:{atk:27,critChance:22},sid:"prometheus_fire"},
    {n:"Pergamena Divina",       i:"📜",r:"common",   s:{atk:4,maxMp:15},     sid:"divine_wisdom"},
    {n:"Sigillo di Zeus",        i:"⚡",r:"uncommon", s:{atk:7,maxMp:25,mpRegen:1},sid:"divine_wisdom"},
    {n:"Scettro dell'Olimpo",    i:"🌩",r:"rare",     s:{atk:13,maxMp:40,mpRegen:2},sid:"divine_wisdom"},
    {n:"Fulmine di Zeus",        i:"⚡",r:"legendary",s:{atk:22,maxMp:65,mpRegen:4},sid:"divine_wisdom"},
  ];
  const A = [
    {n:"Mantello Socratico",    i:"🧥",r:"common",   s:{def:3,maxHp:20},  sid:"socratic_order"},
    {n:"Toga della Dialettica", i:"👘",r:"uncommon", s:{def:6,maxHp:40},  sid:"socratic_order"},
    {n:"Veste dell'Elenchos",   i:"🎓",r:"rare",     s:{def:11,maxHp:70}, sid:"socratic_order"},
    {n:"Armatura del Logos",    i:"🛡",r:"legendary",s:{def:18,maxHp:110},sid:"socratic_order"},
    {n:"Mantello Sofistico",    i:"🎭",r:"common",   s:{def:2,maxHp:30},  sid:"sophist_mask"},
    {n:"Veste del Retore",      i:"👗",r:"uncommon", s:{def:4,maxHp:60},  sid:"sophist_mask"},
    {n:"Abito dell'Oratoria",   i:"🎩",r:"rare",     s:{def:8,maxHp:100}, sid:"sophist_mask"},
    {n:"Corona del Sofista",    i:"👑",r:"legendary",s:{def:12,maxHp:160},sid:"sophist_mask"},
    {n:"Toga Accademica",       i:"🎓",r:"common",   s:{def:3,maxMp:14},  sid:"academy_mind"},
    {n:"Veste di Platone",      i:"🧥",r:"uncommon", s:{def:6,maxMp:25},  sid:"academy_mind"},
    {n:"Armatura Mentale",      i:"🛡",r:"rare",     s:{def:10,maxMp:42}, sid:"academy_mind"},
    {n:"Corazza dell'Intelletto",i:"🧠",r:"legendary",s:{def:16,maxMp:68},sid:"academy_mind"},
    {n:"Tunica dell'Idea",      i:"👘",r:"common",   s:{def:3,critChance:3}, sid:"ideal_form"},
    {n:"Veste dell'Eterno",     i:"🌌",r:"uncommon", s:{def:5,critChance:6}, sid:"ideal_form"},
    {n:"Armatura di Cristallo", i:"💎",r:"rare",     s:{def:9,critChance:10},sid:"ideal_form"},
    {n:"Forma Perfetta",        i:"🌟",r:"legendary",s:{def:15,critChance:16},sid:"ideal_form"},
    {n:"Cintura Etica",         i:"🎗",r:"common",   s:{def:4,atk:3},     sid:"nicomachean"},
    {n:"Cotta di Maglia Virtuosa",i:"⛓",r:"uncommon",s:{def:7,atk:6},    sid:"nicomachean"},
    {n:"Armatura Nicomachea",   i:"🛡",r:"rare",     s:{def:13,atk:10},   sid:"nicomachean"},
    {n:"Egida dell'Etica",      i:"⚖", r:"legendary",s:{def:21,atk:16},   sid:"nicomachean"},
    {n:"Corazza Logica",        i:"🔬",r:"common",   s:{def:5,maxHp:15},  sid:"pure_logic"},
    {n:"Veste dell'Assioma",    i:"📐",r:"uncommon", s:{def:9,maxHp:30},  sid:"pure_logic"},
    {n:"Armatura del Teorema",  i:"🔭",r:"rare",     s:{def:15,maxHp:55}, sid:"pure_logic"},
    {n:"Corazza Assoluta",      i:"🛡",r:"legendary",s:{def:24,maxHp:90}, sid:"pure_logic"},
    {n:"Mantello di Fiamma",    i:"🧥",r:"common",   s:{def:3,critChance:5}, sid:"prometheus_fire"},
    {n:"Corazza Ardente",       i:"🔥",r:"uncommon", s:{def:6,critChance:9}, sid:"prometheus_fire"},
    {n:"Armatura di Prometeo",  i:"⚡",r:"rare",     s:{def:11,critChance:14},sid:"prometheus_fire"},
    {n:"Fiamma Eterna",         i:"☄", r:"legendary",s:{def:18,critChance:22},sid:"prometheus_fire"},
    {n:"Veste degli Dei",       i:"☁", r:"common",   s:{def:3,mpRegen:2}, sid:"divine_wisdom"},
    {n:"Armatura Celeste",      i:"🌤",r:"uncommon", s:{def:6,maxMp:20,mpRegen:2},sid:"divine_wisdom"},
    {n:"Toga dell'Olimpo",      i:"⛅",r:"rare",     s:{def:10,maxMp:35,mpRegen:3},sid:"divine_wisdom"},
    {n:"Veste Immortale",       i:"🌟",r:"legendary",s:{def:16,maxMp:55,mpRegen:6},sid:"divine_wisdom"},
  ];
  const R = [
    {n:"Anello della Dialettica",i:"💍",r:"common",  s:{critChance:3,atk:2},sid:"socratic_order"},
    {n:"Sigillo del Filosofo",   i:"🔮",r:"uncommon",s:{critChance:5,atk:4},sid:"socratic_order"},
    {n:"Anello dell'Elenchos",   i:"🌀",r:"rare",    s:{critChance:9,atk:8},sid:"socratic_order"},
    {n:"Sigillo di Socrate",     i:"♾", r:"legendary",s:{critChance:15,atk:14},sid:"socratic_order"},
    {n:"Anello Sofistico",       i:"💍",r:"common",  s:{maxHp:25},           sid:"sophist_mask"},
    {n:"Gemma del Retore",       i:"💎",r:"uncommon",s:{maxHp:50,def:2},     sid:"sophist_mask"},
    {n:"Anello dell'Inganno",    i:"🌀",r:"rare",    s:{maxHp:85,def:4},     sid:"sophist_mask"},
    {n:"Corona del Mistero",     i:"👑",r:"legendary",s:{maxHp:140,def:7},   sid:"sophist_mask"},
    {n:"Anello dell'Accademia",  i:"📚",r:"common",  s:{maxMp:18,mpRegen:1}, sid:"academy_mind"},
    {n:"Sigillo di Platone",     i:"🔮",r:"uncommon",s:{maxMp:32,mpRegen:2}, sid:"academy_mind"},
    {n:"Anello della Mente",     i:"🧠",r:"rare",    s:{maxMp:52,mpRegen:3}, sid:"academy_mind"},
    {n:"Sigillo Ideale",         i:"💫",r:"legendary",s:{maxMp:80,mpRegen:5},sid:"academy_mind"},
    {n:"Cristallo Anulare",      i:"💍",r:"common",  s:{critChance:5},        sid:"ideal_form"},
    {n:"Anello delle Forme",     i:"💎",r:"uncommon",s:{critChance:9},        sid:"ideal_form"},
    {n:"Sigillo dell'Eterno",    i:"♾", r:"rare",    s:{critChance:14,atk:5},sid:"ideal_form"},
    {n:"Occhio dell'Idea",       i:"👁",r:"legendary",s:{critChance:22,atk:10},sid:"ideal_form"},
    {n:"Anello Etico",           i:"⚖", r:"common",  s:{atk:3,def:3},         sid:"nicomachean"},
    {n:"Sigillo della Virtù",    i:"🌿",r:"uncommon",s:{atk:6,def:5},         sid:"nicomachean"},
    {n:"Anello Nicomacheo",      i:"📜",r:"rare",    s:{atk:10,def:9},        sid:"nicomachean"},
    {n:"Sigillo Aristotelico",   i:"🏺",r:"legendary",s:{atk:17,def:15},      sid:"nicomachean"},
    {n:"Anello Logico",          i:"🔬",r:"common",  s:{def:4,maxHp:20},      sid:"pure_logic"},
    {n:"Sigillo dell'Assioma",   i:"📐",r:"uncommon",s:{def:7,maxHp:40},      sid:"pure_logic"},
    {n:"Anello del Teorema",     i:"∞", r:"rare",    s:{def:12,maxHp:70},     sid:"pure_logic"},
    {n:"Sigillo Assoluto",       i:"🔭",r:"legendary",s:{def:20,maxHp:110},   sid:"pure_logic"},
    {n:"Anello di Fuoco",        i:"🔥",r:"common",  s:{critChance:6,atk:3},  sid:"prometheus_fire"},
    {n:"Sigillo della Fiamma",   i:"💫",r:"uncommon",s:{critChance:11,atk:6}, sid:"prometheus_fire"},
    {n:"Anello Olimpico",        i:"🌟",r:"rare",    s:{critChance:17,atk:10},sid:"prometheus_fire"},
    {n:"Fuoco Eterno",           i:"☄", r:"legendary",s:{critChance:26,atk:16},sid:"prometheus_fire"},
    {n:"Anello Celeste",         i:"⚡",r:"common",  s:{maxMp:20,mpRegen:1},  sid:"divine_wisdom"},
    {n:"Sigillo di Ermes",       i:"☁", r:"uncommon",s:{maxMp:35,mpRegen:2},  sid:"divine_wisdom"},
    {n:"Anello dell'Olimpo",     i:"🌩",r:"rare",    s:{maxMp:55,mpRegen:3},  sid:"divine_wisdom"},
    {n:"Sigillo degli Dei",      i:"✨",r:"legendary",s:{maxMp:88,mpRegen:5,atk:8},sid:"divine_wisdom"},
  ];
  const AM = [
    {n:"Amuleto Socratico",       i:"📿",r:"common",   s:{maxHp:22,atk:2},    sid:"socratic_order"},
    {n:"Medaglione del Filosofo", i:"🏺",r:"uncommon", s:{maxHp:45,atk:5},    sid:"socratic_order"},
    {n:"Ciondolo dell'Elenchos",  i:"🌀",r:"rare",     s:{maxHp:78,atk:9},    sid:"socratic_order"},
    {n:"Amuleto del Logos",       i:"✨",r:"legendary",s:{maxHp:125,atk:15},  sid:"socratic_order"},
    {n:"Amuleto Sofistico",       i:"🎭",r:"common",   s:{maxHp:35},           sid:"sophist_mask"},
    {n:"Collana del Retore",      i:"📿",r:"uncommon", s:{maxHp:70,mpRegen:1}, sid:"sophist_mask"},
    {n:"Amuleto dell'Illusione",  i:"🌫",r:"rare",     s:{maxHp:115,mpRegen:2},sid:"sophist_mask"},
    {n:"Cuore del Sofista",       i:"🖤",r:"legendary",s:{maxHp:185,mpRegen:4},sid:"sophist_mask"},
    {n:"Amuleto Accademico",      i:"📚",r:"common",   s:{maxMp:22,maxHp:18}, sid:"academy_mind"},
    {n:"Ciondolo di Platone",     i:"💫",r:"uncommon", s:{maxMp:38,maxHp:35}, sid:"academy_mind"},
    {n:"Amuleto della Mente",     i:"🧠",r:"rare",     s:{maxMp:60,maxHp:60}, sid:"academy_mind"},
    {n:"Cuore dell'Accademia",    i:"💙",r:"legendary",s:{maxMp:95,maxHp:95}, sid:"academy_mind"},
    {n:"Amuleto del Cristallo",   i:"💎",r:"common",   s:{critChance:4,maxHp:20},sid:"ideal_form"},
    {n:"Ciondolo Eterno",         i:"♾", r:"uncommon", s:{critChance:7,maxHp:40},sid:"ideal_form"},
    {n:"Amuleto dell'Idea",       i:"🌟",r:"rare",     s:{critChance:12,maxHp:68},sid:"ideal_form"},
    {n:"Cuore dell'Eterno",       i:"💛",r:"legendary",s:{critChance:20,maxHp:110},sid:"ideal_form"},
    {n:"Amuleto Etico",           i:"⚖", r:"common",   s:{atk:4,def:4},       sid:"nicomachean"},
    {n:"Ciondolo Aristotelico",   i:"🏺",r:"uncommon", s:{atk:7,def:7},       sid:"nicomachean"},
    {n:"Amuleto Nicomacheo",      i:"📜",r:"rare",     s:{atk:12,def:12},     sid:"nicomachean"},
    {n:"Cuore della Virtù",       i:"💚",r:"legendary",s:{atk:20,def:20},     sid:"nicomachean"},
    {n:"Amuleto Logico",          i:"🔬",r:"common",   s:{def:6,mpRegen:1},   sid:"pure_logic"},
    {n:"Ciondolo dell'Assioma",   i:"📐",r:"uncommon", s:{def:10,mpRegen:2,maxHp:25},sid:"pure_logic"},
    {n:"Amuleto del Teorema",     i:"∞", r:"rare",     s:{def:17,mpRegen:3,maxHp:50},sid:"pure_logic"},
    {n:"Cuore Logico",            i:"🤍",r:"legendary",s:{def:28,mpRegen:5,maxHp:80},sid:"pure_logic"},
    {n:"Amuleto di Prometeo",     i:"🔥",r:"common",   s:{critChance:7,atk:3},sid:"prometheus_fire"},
    {n:"Torcia dell'Olimpo",      i:"🕯",r:"uncommon", s:{critChance:12,atk:6},sid:"prometheus_fire"},
    {n:"Fiamma del Titano",       i:"🌋",r:"rare",     s:{critChance:18,atk:10},sid:"prometheus_fire"},
    {n:"Cuore di Fuoco",          i:"❤‍🔥",r:"legendary",s:{critChance:28,atk:17},sid:"prometheus_fire"},
    {n:"Amuleto Celeste",         i:"⭐",r:"common",   s:{maxMp:25,maxHp:20}, sid:"divine_wisdom"},
    {n:"Ciondolo di Apollo",      i:"🌞",r:"uncommon", s:{maxMp:42,maxHp:40,mpRegen:1},sid:"divine_wisdom"},
    {n:"Amuleto dell'Olimpo",     i:"🌟",r:"rare",     s:{maxMp:68,maxHp:65,mpRegen:2},sid:"divine_wisdom"},
    {n:"Cuore degli Dei",         i:"💜",r:"legendary",s:{maxMp:108,maxHp:105,mpRegen:4},sid:"divine_wisdom"},
  ];
  const B = [
    {n:"Sandali Socratici",       i:"👡",r:"common",   s:{def:2,critChance:2},          sid:"socratic_order"},
    {n:"Calzari del Filosofo",    i:"👟",r:"uncommon", s:{def:4,critChance:4},          sid:"socratic_order"},
    {n:"Sandali dell'Elenchos",   i:"🥿",r:"rare",     s:{def:7,critChance:7,atk:4},   sid:"socratic_order"},
    {n:"Stivali del Logos",       i:"🥾",r:"legendary",s:{def:12,critChance:12,atk:7}, sid:"socratic_order"},
    {n:"Sandali Sofistici",       i:"👡",r:"common",   s:{def:2,maxHp:22},              sid:"sophist_mask"},
    {n:"Calzari del Retore",      i:"👟",r:"uncommon", s:{def:4,maxHp:44},              sid:"sophist_mask"},
    {n:"Stivali dell'Illusione",  i:"🥿",r:"rare",     s:{def:7,maxHp:75},              sid:"sophist_mask"},
    {n:"Sandali del Mistero",     i:"🌫",r:"legendary",s:{def:11,maxHp:120},            sid:"sophist_mask"},
    {n:"Sandali Accademici",      i:"🎓",r:"common",   s:{def:2,maxMp:16},              sid:"academy_mind"},
    {n:"Calzari di Platone",      i:"👟",r:"uncommon", s:{def:4,maxMp:28},              sid:"academy_mind"},
    {n:"Sandali della Mente",     i:"🧠",r:"rare",     s:{def:7,maxMp:46,mpRegen:1},   sid:"academy_mind"},
    {n:"Stivali dell'Intelletto", i:"💙",r:"legendary",s:{def:11,maxMp:72,mpRegen:3},  sid:"academy_mind"},
    {n:"Sandali dell'Idea",       i:"💎",r:"common",   s:{def:2,critChance:4},          sid:"ideal_form"},
    {n:"Calzari Eterni",          i:"♾", r:"uncommon", s:{def:4,critChance:7},          sid:"ideal_form"},
    {n:"Sandali di Cristallo",    i:"💎",r:"rare",     s:{def:7,critChance:11,atk:3},  sid:"ideal_form"},
    {n:"Stivali della Forma",     i:"🌟",r:"legendary",s:{def:11,critChance:18,atk:6}, sid:"ideal_form"},
    {n:"Sandali Etici",           i:"⚖", r:"common",   s:{atk:3,def:3},                sid:"nicomachean"},
    {n:"Calzari della Virtù",     i:"🌿",r:"uncommon", s:{atk:5,def:5,maxHp:20},       sid:"nicomachean"},
    {n:"Stivali Nicomachei",      i:"📜",r:"rare",     s:{atk:9,def:9,maxHp:40},       sid:"nicomachean"},
    {n:"Sandali Aristotelici",    i:"🏺",r:"legendary",s:{atk:15,def:15,maxHp:65},     sid:"nicomachean"},
    {n:"Sandali Logici",          i:"🔬",r:"common",   s:{def:5,maxHp:18},              sid:"pure_logic"},
    {n:"Calzari dell'Assioma",    i:"📐",r:"uncommon", s:{def:9,maxHp:36},              sid:"pure_logic"},
    {n:"Stivali del Teorema",     i:"∞", r:"rare",     s:{def:15,maxHp:60,mpRegen:1},  sid:"pure_logic"},
    {n:"Sandali Assoluti",        i:"🔭",r:"legendary",s:{def:24,maxHp:100,mpRegen:3}, sid:"pure_logic"},
    {n:"Sandali di Prometeo",     i:"🔥",r:"common",   s:{critChance:6,def:2},          sid:"prometheus_fire"},
    {n:"Calzari della Fiamma",    i:"🕯",r:"uncommon", s:{critChance:10,def:4},         sid:"prometheus_fire"},
    {n:"Stivali Olimpici",        i:"⚡",r:"rare",     s:{critChance:16,def:7,atk:5},  sid:"prometheus_fire"},
    {n:"Sandali del Fuoco Eterno",i:"☄", r:"legendary",s:{critChance:25,def:11,atk:9}, sid:"prometheus_fire"},
    {n:"Sandali Celesti",         i:"☁", r:"common",   s:{maxMp:18,def:2},              sid:"divine_wisdom"},
    {n:"Calzari di Ermes",        i:"⚡",r:"uncommon", s:{maxMp:30,def:4,mpRegen:1},   sid:"divine_wisdom"},
    {n:"Stivali dell'Olimpo",     i:"🌩",r:"rare",     s:{maxMp:50,def:7,mpRegen:2},   sid:"divine_wisdom"},
    {n:"Sandali degli Dei",       i:"✨",r:"legendary",s:{maxMp:80,def:11,mpRegen:4},  sid:"divine_wisdom"},
  ];
  const norm = (arr, slot) => arr.map(t => ({name:t.n,icon:t.i,rarity:t.r,stats:t.s,setId:t.sid,slot}));
  return {weapon:norm(W,'weapon'), armor:norm(A,'armor'), ring:norm(R,'ring'), amulet:norm(AM,'amulet'), boots:norm(B,'boots')};
}

// ── GAME STATE ───────────────────────────────────────────────
function defaultState() {
  return {
    floor:1, wisdom:0, totalKills:0, prestige:0, prestigeBonus:1, wisdomMult:1,
    domainActive:false, domainId:null, domainEnemy:1, domainLoot:[],
    battleOver:false, playerTurn:true,
    autoMode:false, autoTimer:null,
    cooldowns:[0,0,0,0], playerStatuses:[], enemyStatuses:[],
    upgradeLevels:{dialectics:0,virtue:0,temperance:0,logos:0,insight:0,wisdom_gain:0},
    playerName:'Socrate',
    player:{hp:100,baseMaxHp:100,mp:60,baseMaxMp:60,baseMpRegen:3,baseAtk:10,baseDef:0,baseCritChance:5},
    enemy:{name:'',hp:80,maxHp:80,atk:8,def:0},
    inventory:[],
    equipped:{weapon:null,armor:null,ring:null,amulet:null,boots:null},
    nextItemId:1,
    invFilter:'all',
  };
}

let G = defaultState();

// ── SAVE / LOAD ──────────────────────────────────────────────
const SAVE_KEY = 'sokrates_save';
let _saveTimer = null;

function saveGame() {
  // Only save what we need — skip autoTimer (non-serializable)
  const toSave = {
    floor:G.floor, wisdom:G.wisdom, totalKills:G.totalKills,
    prestige:G.prestige, prestigeBonus:G.prestigeBonus, wisdomMult:G.wisdomMult,
    domainActive:G.domainActive, domainId:G.domainId, domainEnemy:G.domainEnemy,
    upgradeLevels:G.upgradeLevels, playerName:G.playerName,
    player:{...G.player}, inventory:G.inventory,
    equipped:G.equipped, nextItemId:G.nextItemId, invFilter:G.invFilter,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    flashSaveBadge();
  } catch(e) {
    console.warn('Save failed:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    // Merge saved data into G, keeping runtime defaults for anything missing
    Object.assign(G, saved);
    // Rebuild equipped references to point at actual inventory objects
    // (they were serialized separately; re-link by id)
    Object.keys(G.equipped).forEach(slot => {
      const eq = G.equipped[slot];
      if (eq) {
        const found = G.inventory.find(i => i.id === eq.id);
        if (found) {
          found.equipped = true;
          G.equipped[slot] = found;
        } else {
          G.equipped[slot] = null;
        }
      }
    });
    // Reset volatile battle state
    G.battleOver = false;
    G.playerTurn = true;
    G.cooldowns = [0,0,0,0];
    G.playerStatuses = [];
    G.enemyStatuses = [];
    G.autoMode = false;
    G.autoTimer = null;
    // Exit any active domain on load (resume from tower)
    G.domainActive = false;
    G.domainId = null;
    G.domainEnemy = 1;
    G.domainLoot = [];
    return true;
  } catch(e) {
    console.warn('Load failed:', e);
    return false;
  }
}

function scheduleSave() {
  // Debounce: save 1.5s after the last game-changing event
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveGame, 1500);
}

function flashSaveBadge() {
  const badge = document.getElementById('save-badge');
  if (!badge) return;
  badge.classList.add('visible');
  clearTimeout(badge._timer);
  badge._timer = setTimeout(() => badge.classList.remove('visible'), 2000);
}

function resetSave() {
  if (!confirm('Sei sicuro di voler cancellare tutti i progressi? L\'azione è irreversibile.')) return;
  localStorage.removeItem(SAVE_KEY);
  stopAuto();
  G = defaultState();
  spawnTowerEnemy();
  updateUI();
  renderUpgrades();
  renderEquip();
  renderInventory();
  renderDomains();
  document.getElementById('btn-next').style.display = 'none';
  document.getElementById('btn-attack').disabled = false;
  document.getElementById('btn-exit-domain').style.display = 'none';
  document.getElementById('domain-progress').style.display = 'none';
  addLog('✦ Reset effettuato. Il cammino ricomincia.', 'system');
}

// ── PRESTIGE FORMULA ─────────────────────────────────────────
function prestigeRequiredFloor() { return 20 + G.prestige * 2; }

// ── STATS ────────────────────────────────────────────────────
function computeStats() {
  const p = G.player;
  let atk=p.baseAtk, def=p.baseDef, maxHp=p.baseMaxHp,
      critChance=p.baseCritChance, maxMp=p.baseMaxMp, mpRegen=p.baseMpRegen;
  Object.values(G.equipped).forEach(item => {
    if (!item) return;
    if (item.stats.atk)       atk       += item.stats.atk;
    if (item.stats.def)       def       += item.stats.def;
    if (item.stats.maxHp)     maxHp     += item.stats.maxHp;
    if (item.stats.critChance)critChance+= item.stats.critChance;
    if (item.stats.maxMp)     maxMp     += item.stats.maxMp;
    if (item.stats.mpRegen)   mpRegen   += item.stats.mpRegen;
  });
  const counts = getSetCounts();
  Object.entries(counts).forEach(([sid,cnt]) => {
    if (cnt < 2) return;
    const b = SETS[sid].bonus2;
    if (b.atkPct)       atk       = Math.round(atk       * (1+b.atkPct));
    if (b.defPct)       def       = Math.round((def||1)  * (1+b.defPct));
    if (b.maxHpPct)     maxHp     = Math.round(maxHp     * (1+b.maxHpPct));
    if (b.critChancePct)critChance= Math.round(critChance* (1+b.critChancePct));
    if (b.maxMpPct)     maxMp     = Math.round(maxMp     * (1+b.maxMpPct));
  });
  return {atk, def, maxHp, critChance, maxMp, mpRegen};
}

function getSetCounts() {
  const counts = {};
  Object.values(G.equipped).forEach(item => {
    if (!item || !item.setId) return;
    counts[item.setId] = (counts[item.setId]||0) + 1;
  });
  return counts;
}

function getActiveBonus4Specials() {
  const counts = getSetCounts();
  const sp = new Set();
  Object.entries(counts).forEach(([sid,cnt]) => {
    if (cnt >= 4 && SETS[sid].bonus4special) sp.add(SETS[sid].bonus4special);
  });
  return sp;
}

function getWisdomBonus() {
  const counts = getSetCounts();
  let m = 1;
  Object.entries(counts).forEach(([sid,cnt]) => {
    if (cnt >= 2 && SETS[sid].bonus2.wisdomPct) m += SETS[sid].bonus2.wisdomPct * (cnt >= 4 ? 2 : 1);
  });
  return m;
}

// ── ITEM FACTORY ─────────────────────────────────────────────
function makeItem(domainId = null) {
  const r = Math.random();
  let rarity;
  if (domainId) {
    if (r < .06)  rarity = 'legendary';
    else if (r < .22) rarity = 'rare';
    else if (r < .55) rarity = 'uncommon';
    else rarity = 'common';
  } else {
    if (r < .03)  rarity = 'legendary';
    else if (r < .13) rarity = 'rare';
    else if (r < .38) rarity = 'uncommon';
    else rarity = 'common';
  }
  const slots = Object.keys(SLOT_ICONS);
  const slot = slots[Math.floor(Math.random() * slots.length)];
  let pool;
  if (domainId) {
    const dom = DOMAINS.find(d => d.id === domainId);
    pool = ITEMS_DB[slot].filter(t => dom.sets.includes(t.setId) && t.rarity === rarity);
    if (!pool.length) pool = ITEMS_DB[slot].filter(t => dom.sets.includes(t.setId));
  } else {
    pool = ITEMS_DB[slot].filter(t => t.rarity === rarity);
    if (!pool.length) pool = ITEMS_DB[slot];
  }
  const base = pool[Math.floor(Math.random() * pool.length)];
  const refFloor = G.domainActive ? (G.floor + DOMAINS.find(d=>d.id===G.domainId).scaleMult*10) : G.floor;
  const scale = 1 + Math.max(0, refFloor-1) * 0.05;
  const scaledStats = {};
  Object.entries(base.stats).forEach(([k,v]) => { scaledStats[k] = Math.round(v * scale); });
  return {id:G.nextItemId++, slot, name:base.name, icon:base.icon, rarity:base.rarity, stats:scaledStats, setId:base.setId, equipped:false};
}

function addToInventory(item) {
  if (G.inventory.length >= 30) {
    const idx = G.inventory.findIndex(i => !i.equipped);
    if (idx >= 0) G.inventory.splice(idx, 1);
    else return false;
  }
  G.inventory.push(item);
  return true;
}

// ── ITEM MANAGEMENT ──────────────────────────────────────────
function equipItem(itemId) {
  const item = G.inventory.find(i => i.id === itemId);
  if (!item) return;
  if (G.equipped[item.slot]) G.equipped[item.slot].equipped = false;
  item.equipped = true;
  G.equipped[item.slot] = item;
  const st = computeStats();
  G.player.hp = Math.min(G.player.hp, st.maxHp);
  G.player.mp = Math.min(G.player.mp, st.maxMp);
  addLog(`Equipaggiato: <b>${item.name}</b> [${SETS[item.setId].name}]`, 'item');
  checkSetMessages();
  renderEquip(); renderInventory(); updateUI();
  scheduleSave();
}

function unequipItem(slot) {
  if (!G.equipped[slot]) return;
  G.equipped[slot].equipped = false;
  G.equipped[slot] = null;
  renderEquip(); renderInventory(); updateUI();
  scheduleSave();
}

function sellItem(itemId) {
  const item = G.inventory.find(i => i.id === itemId);
  if (!item || item.equipped) return;
  G.wisdom += SELL_PRICES[item.rarity];
  G.inventory = G.inventory.filter(i => i.id !== itemId);
  addLog(`Venduto: <b>${item.name}</b> per ${SELL_PRICES[item.rarity]} Saggezza.`, 'sell');
  updateUI(); renderInventory(); renderUpgrades();
  scheduleSave();
}

function sellAll() {
  const toSell = G.inventory.filter(i => !i.equipped && (i.rarity === 'common' || i.rarity === 'uncommon'));
  if (!toSell.length) { addLog('Niente da vendere (Comuni e Non Comuni non equipaggiati).', 'system'); return; }
  let total = 0;
  toSell.forEach(i => total += SELL_PRICES[i.rarity]);
  G.inventory = G.inventory.filter(i => i.equipped || (i.rarity !== 'common' && i.rarity !== 'uncommon'));
  G.wisdom += total;
  addLog(`Venduti ${toSell.length} oggetti per <b>${total}</b> Saggezza.`, 'sell');
  updateUI(); renderInventory(); renderUpgrades();
  scheduleSave();
}

function setFilter(btn, f) {
  G.invFilter = f;
  document.querySelectorAll('.inv-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderInventory();
}

function checkSetMessages() {
  const counts = getSetCounts();
  Object.entries(counts).forEach(([sid,cnt]) => {
    const s = SETS[sid];
    if (cnt === 2) addLog(`✦ Set 2pc: <b>${s.name}</b> — ${s.desc2}`, 'set');
    if (cnt === 4) addLog(`⚡ Set 4pc: <b>${s.name}</b> — ${s.desc4}`, 'set');
  });
}

// ── DOMAIN FLOW ──────────────────────────────────────────────
function enterDomain(domainId) {
  if (G.domainActive) { addLog('Esci prima dal dominio attuale!', 'system'); return; }
  if (G.wisdom < DOMAIN_COST) { addLog(`Servono ${DOMAIN_COST} Saggezza per entrare nel Dominio.`, 'system'); return; }
  G.wisdom -= DOMAIN_COST;
  G.domainActive = true; G.domainId = domainId; G.domainEnemy = 1; G.domainLoot = [];
  G.battleOver = false; G.playerTurn = true;
  G.playerStatuses = []; G.enemyStatuses = []; G.cooldowns = [0,0,0,0];
  const dom = DOMAINS.find(d => d.id === domainId);
  addLog(`✦ Entrato nel Dominio: <b>${dom.name}</b>! 5 nemici ti attendono.`, 'domain');
  spawnDomainEnemy();
  document.getElementById('btn-exit-domain').style.display = 'inline-block';
  document.getElementById('btn-attack').disabled = false;
  document.getElementById('btn-next').style.display = 'none';
  updateUI(); updateDomainProgress(); renderDomains();
  scheduleSave();
}

function exitDomain() {
  if (!G.domainActive) return;
  G.domainActive = false; G.domainId = null; G.domainEnemy = 1; G.domainLoot = [];
  G.battleOver = false; G.playerTurn = true;
  G.playerStatuses = []; G.enemyStatuses = []; G.cooldowns = [0,0,0,0];
  addLog('Sei uscito dal Dominio. Ritorno alla Torre.', 'system');
  document.getElementById('btn-exit-domain').style.display = 'none';
  document.getElementById('domain-progress').style.display = 'none';
  stopAuto();
  spawnTowerEnemy();
  document.getElementById('btn-attack').disabled = false;
  document.getElementById('btn-next').style.display = 'none';
  updateUI(); renderDomains();
  scheduleSave();
}

function spawnDomainEnemy() {
  const dom = DOMAINS.find(d => d.id === G.domainId);
  const base = DOMAIN_ENEMIES[dom.enemyKey][G.domainEnemy - 1];
  const scale = Math.pow(1.18, G.floor) * dom.scaleMult;
  G.enemy = {
    name: base.name, title: base.title,
    hp: Math.floor(80 * scale), maxHp: Math.floor(80 * scale),
    atk: Math.floor(8 * Math.pow(1.12, G.floor) * dom.scaleMult * 0.7),
    def: Math.floor(G.floor * 0.6 * dom.scaleMult),
  };
  document.getElementById('enemy-name').textContent = base.icon + ' ' + base.name;
  document.getElementById('enemy-title').textContent = base.title;
  document.getElementById('enemy-card').classList.add('domain-enemy');
  document.getElementById('arena-location').innerHTML = `<span style="color:${dom.color}">${dom.icon} ${dom.name}</span>`;
  document.getElementById('domain-progress').style.display = 'flex';
  updateDomainProgress();
}

function updateDomainProgress() {
  if (!G.domainActive) return;
  const dom = DOMAINS.find(d => d.id === G.domainId);
  for (let i = 0; i < 5; i++) {
    const el = document.getElementById('ds' + i);
    const n = i + 1;
    el.className = 'domain-step ' + (n < G.domainEnemy ? 'done' : n === G.domainEnemy ? 'current' : 'pending');
    if (n < G.domainEnemy)  { el.style.background = dom.color; el.style.borderColor = dom.color; }
    if (n === G.domainEnemy){ el.style.background = dom.color; el.style.borderColor = dom.color; }
    if (n > G.domainEnemy)  { el.style.background = ''; el.style.borderColor = ''; }
  }
  document.getElementById('domain-enemy-label').textContent = `Nemico ${G.domainEnemy}/5`;
}

// ── COMBAT ───────────────────────────────────────────────────
const SKILLS = [
  {name:'Elenchos', cost:0, cd:0,
   use(g) {
     const st=computeStats(), sp=getActiveBonus4Specials();
     const hits = sp.has('elenchosDouble') ? 2 : 1;
     let total = 0;
     for (let h=0; h<hits; h++) {
       let base = st.atk * (1 + g.floor * 0.05);
       const crit = Math.random()*100 < st.critChance;
       const cm = sp.has('critMult') ? 3.5 : 2.2;
       if (crit) base *= cm;
       const dmg = Math.max(1, Math.round(base - g.enemy.def));
       total += dmg; dealDamageToEnemy(dmg, crit);
     }
     if (sp.has('elenchosDouble')) addLog(`${g.playerName} usa <b>Elenchos ×2</b> [4pc]! ${total} danni!`, 'crit');
     else addLog(`${g.playerName} usa <b>Elenchos</b>. ${total} danni.`, 'player');
     if (sp.has('logosAttackRegen')) { const mst=computeStats(); g.player.mp=Math.min(g.player.mp+5,mst.maxMp); }
     return true;
   }},
  {name:'Maieutica', cost:20, cd:3,
   use(g) {
     const st=computeStats(), sp=getActiveBonus4Specials();
     const pct = sp.has('maieuticaBoost') ? .38 : .18;
     const heal = Math.round(st.maxHp * pct + st.atk * .5);
     g.player.hp = Math.min(g.player.hp + heal, st.maxHp);
     showHealPop('player-card', heal);
     g.playerStatuses.push({type:'buff', name:'Saggezza+', turns:3});
     addLog(`${g.playerName} usa <b>Maieutica</b>${sp.has('maieuticaBoost')?' [4pc]':''}. +${heal} HP.`, 'player');
     if (sp.has('logosAttackRegen')) { const mst=computeStats(); g.player.mp=Math.min(g.player.mp+5,mst.maxMp); }
     return true;
   }},
  {name:'Eironeia', cost:25, cd:4,
   use(g) {
     const st=computeStats(), sp=getActiveBonus4Specials();
     const turns   = sp.has('eironeiaBuff') ? 6   : 3;
     const atkMult = sp.has('eironeiaBuff') ? .3  : .5;
     g.enemyStatuses.push({type:'debuff', name:'Confuso', turns, atkMult});
     const dmg = Math.round(st.atk * .8);
     dealDamageToEnemy(dmg, false);
     addLog(`${g.playerName} usa <b>Eironeia</b>${sp.has('eironeiaBuff')?' [4pc 6T]':''}! ${dmg} danni.`, 'player');
     if (sp.has('logosAttackRegen')) { const mst=computeStats(); g.player.mp=Math.min(g.player.mp+5,mst.maxMp); }
     return true;
   }},
  {name:'Aporia', cost:40, cd:5,
   use(g) {
     const st=computeStats(), sp=getActiveBonus4Specials();
     const boost = sp.has('aporiaBoost') ? 1.8 : 1;
     let total = 0;
     for (let i=0; i<3; i++) {
       const dmg = Math.max(1, Math.round(st.atk * 1.4 * boost - g.enemy.def));
       total += dmg; dealDamageToEnemy(dmg, false);
     }
     addLog(`${g.playerName} usa <b>Aporia</b>${sp.has('aporiaBoost')?' [4pc +80%]':''}! ${total} danni!`, 'crit');
     if (sp.has('logosAttackRegen')) { const mst=computeStats(); g.player.mp=Math.min(g.player.mp+5,mst.maxMp); }
     return true;
   }},
];

function dealDamageToEnemy(dmg, crit) {
  G.enemy.hp = Math.max(0, G.enemy.hp - dmg);
  showDmgPop('enemy-card', dmg, crit ? '#ffd700' : '#e08080');
}
function dealDamageToPlayer(dmg) {
  const st = computeStats();
  const r = Math.max(1, dmg - st.def);
  G.player.hp = Math.max(0, G.player.hp - r);
  showDmgPop('player-card', r, '#ff8080');
  return r;
}
function showDmgPop(cid, dmg, color) {
  const c = document.getElementById(cid);
  const p = document.createElement('div');
  p.className = 'dmg-pop'; p.style.color = color;
  p.style.left = (15 + Math.random()*55) + '%'; p.style.top = '15%';
  p.textContent = '-' + dmg; c.appendChild(p);
  setTimeout(() => p.remove(), 1200);
}
function showHealPop(cid, val) {
  const c = document.getElementById(cid);
  const p = document.createElement('div');
  p.className = 'dmg-pop heal-pop';
  p.style.left = (15 + Math.random()*55) + '%'; p.style.top = '15%';
  p.textContent = '+' + val; c.appendChild(p);
  setTimeout(() => p.remove(), 1200);
}
function addLog(msg, type='system') {
  const log = document.getElementById('combat-log');
  const e = document.createElement('div');
  e.className = `log-entry log-${type}`; e.innerHTML = msg;
  log.appendChild(e);
  if (log.children.length > 80) log.children[0].remove();
  log.scrollTop = log.scrollHeight;
}

function attack() { if (!G.playerTurn || G.battleOver) return; useSkill(0); }
function useSkill(idx) {
  if (!G.playerTurn || G.battleOver) return;
  const skill = SKILLS[idx];
  if (G.cooldowns[idx] > 0) { addLog(`${skill.name} in ricarica: ${G.cooldowns[idx]} turni.`); return; }
  if (G.player.mp < skill.cost) { addLog(`Logos insufficiente per ${skill.name}.`); return; }
  G.player.mp -= skill.cost;
  if (skill.cd > 0) G.cooldowns[idx] = skill.cd;
  if (!skill.use(G)) return;
  G.playerTurn = false; updateUI();
  if (checkBattleEnd()) return;
  setTimeout(enemyTurn, 650);
}

function enemyTurn() {
  if (G.battleOver) return;
  const sp = getActiveBonus4Specials();
  if (sp.has('turnRegen')) {
    const st = computeStats();
    const reg = Math.round(st.maxHp * .03);
    G.player.hp = Math.min(G.player.hp + reg, st.maxHp);
    if (reg > 0) showHealPop('player-card', reg);
  }
  const debuff = G.enemyStatuses.find(s => s.type === 'debuff');
  if (debuff) addLog(`${G.enemy.name} è Confuso! ATK ridotto.`, 'enemy');
  let baseAtk = Math.round(G.enemy.atk * (debuff ? debuff.atkMult : 1));
  if (G.floor >= 10 && Math.random() < .28) {
    const dmg = dealDamageToPlayer(Math.round(baseAtk * 1.8));
    addLog(`${G.enemy.name} usa attacco speciale! ${dmg} danni!`, 'enemy');
  } else {
    const dmg = dealDamageToPlayer(baseAtk);
    addLog(`${G.enemy.name} attacca per ${dmg} danni.`, 'enemy');
  }
  G.playerStatuses = G.playerStatuses.filter(s => { s.turns--; return s.turns > 0; });
  G.enemyStatuses  = G.enemyStatuses.filter(s  => { s.turns--; return s.turns > 0; });
  const st = computeStats();
  G.player.mp = Math.min(G.player.mp + st.mpRegen, st.maxMp);
  G.cooldowns = G.cooldowns.map(cd => Math.max(0, cd-1));
  G.playerTurn = true; updateUI(); checkBattleEnd();
}

function checkBattleEnd() {
  if (G.enemy.hp <= 0) {
    G.battleOver = true; G.totalKills++;

    if (G.domainActive) {
      // ── DOMAIN branch ──
      addLog(`✦ Nemico ${G.domainEnemy}/5 sconfitto nel Dominio!`, 'domain');

      if (G.domainEnemy >= 5) {
        // Domain complete — give loot, give wisdom, but DO NOT touch G.floor
        const lootCount = 3 + Math.floor(Math.random() * 4); // 3-6
        const loot = [];
        for (let i = 0; i < lootCount; i++) {
          const item = makeItem(G.domainId);
          addToInventory(item);
          loot.push(item);
        }
        const wGain = Math.floor(50 * Math.pow(1.1, G.floor) * G.wisdomMult * getWisdomBonus() * G.prestigeBonus);
        G.wisdom += wGain;
        // ← G.floor++ intentionally removed (bug fix)
        updateUI(); renderInventory();
        showDomainCompleteOverlay(loot, wGain);
        scheduleSave();
      } else {
        // Next domain enemy
        G.domainEnemy++;
        G.battleOver = false; G.playerTurn = true;
        G.playerStatuses = []; G.enemyStatuses = []; G.cooldowns = [0,0,0,0];
        const st = computeStats();
        G.player.mp = Math.min(G.player.mp + Math.round(st.maxMp * .2), st.maxMp);
        spawnDomainEnemy(); updateUI();
        addLog(`— Avanza: Nemico ${G.domainEnemy}/5 —`, 'domain');
        if (G.autoMode) scheduleAuto();
      }

    } else {
      // ── TOWER branch ──
      const wisdomM = G.wisdomMult * getWisdomBonus();
      const wGain = Math.floor(10 * Math.pow(1.15, G.floor) * wisdomM * G.prestigeBonus);
      G.wisdom += wGain;
      G.floor++;                           // ← only the tower increments the floor
      const droppedItem = Math.random() < .70 ? makeItem(null) : null;
      if (droppedItem) addToInventory(droppedItem);
      const sp = getActiveBonus4Specials();
      if (sp.has('victoryHeal')) {
        const st = computeStats();
        const h = Math.round(st.maxHp * .30);
        G.player.hp = Math.min(G.player.hp + h, st.maxHp);
        addLog(`Vittoria curata [4pc]: +${h} HP.`, 'set');
      }
      updateUI(); renderInventory();
      showVictoryOverlay(wGain, droppedItem);
      scheduleSave();
    }
    return true;
  }

  if (G.player.hp <= 0) {
    G.battleOver = true; stopAuto();
    addLog(`${G.playerName} è caduto!`, 'system');
    showDefeatOverlay();
    return true;
  }
  return false;
}

function nextBattle() {
  if (G.domainActive) return;
  spawnTowerEnemy();
  G.battleOver = false; G.playerTurn = true;
  G.playerStatuses = []; G.enemyStatuses = []; G.cooldowns = [0,0,0,0];
  const st = computeStats();
  G.player.mp = Math.min(G.player.mp + Math.round(st.maxMp * .3), st.maxMp);
  document.getElementById('btn-next').style.display = 'none';
  document.getElementById('btn-attack').disabled = false;
  updateUI();
  addLog(`— Nuovo sfidante: ${G.enemy.name} —`, 'system');
  if (G.autoMode) scheduleAuto();
}

function spawnTowerEnemy() {
  const base = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
  const scale = Math.pow(1.18, G.floor);
  G.enemy = {
    name:base.name, title:base.title,
    hp:Math.floor(60*scale), maxHp:Math.floor(60*scale),
    atk:Math.floor(6*Math.pow(1.12,G.floor)), def:Math.floor(G.floor*.4),
  };
  document.getElementById('enemy-name').textContent = base.icon + ' ' + base.name;
  document.getElementById('enemy-title').textContent = base.title;
  document.getElementById('enemy-card').classList.remove('domain-enemy');
  document.getElementById('arena-location').innerHTML = `Torre · Piano <span id="floor-num">${G.floor}</span>`;
  document.getElementById('domain-progress').style.display = 'none';
}

// ── OVERLAYS ─────────────────────────────────────────────────
function showVictoryOverlay(wGain, droppedItem) {
  document.getElementById('ov-icon').textContent = '🏛';
  document.getElementById('ov-title').textContent = 'Vittoria!';
  document.getElementById('ov-body').textContent = `"${G.enemy.name}" sconfitto con la Dialettica.`;
  document.getElementById('ov-rewards').innerHTML =
    `<div class="reward-line">+${wGain} Saggezza</div><div class="reward-line">Piano ${G.floor} sbloccato</div>`;
  const drop = document.getElementById('ov-item-drop');
  if (droppedItem) {
    const set = SETS[droppedItem.setId];
    drop.innerHTML = `<div class="item-drop-box">
      <div class="item-drop-label">⚗ Oggetto trovato!</div>
      <div class="item-drop-row">
        <div class="item-drop-icon">${droppedItem.icon}</div>
        <div class="item-drop-info">
          <div class="item-drop-name" style="color:${rarityColor(droppedItem.rarity)}">${droppedItem.name}
            <span class="rarity-pill rp-${droppedItem.rarity}">${RARITY_NAMES[droppedItem.rarity]}</span></div>
          <div class="item-drop-sub">${SLOT_NAMES[droppedItem.slot]}</div>
          <div class="item-drop-stats">${statsText(droppedItem.stats)}</div>
          <div class="item-drop-set" style="color:${set.color}">${set.icon} ${set.name}</div>
        </div>
      </div></div>`;
  } else {
    drop.innerHTML = '<div style="font-size:12px;color:var(--text-dim);padding:6px 0;font-style:italic">Nessun oggetto questa volta…</div>';
  }
  document.getElementById('overlay').classList.add('show');
}

function showDomainCompleteOverlay(loot, wGain) {
  const dom = DOMAINS.find(d => d.id === G.domainId);
  document.getElementById('ov-icon').textContent = dom.icon;
  document.getElementById('ov-title').textContent = 'Dominio Completato!';
  document.getElementById('ov-body').textContent = `Hai sconfitto tutti e 5 i guardiani del ${dom.name}.`;
  document.getElementById('ov-rewards').innerHTML =
    `<div class="reward-line" style="color:${dom.color}">+${wGain} Saggezza</div>
     <div class="reward-line">${loot.length} Oggetti guadagnati</div>`;
  const drop = document.getElementById('ov-item-drop');
  let html = `<div class="loot-domain-label">⚗ Bottino del Dominio (${loot.length} oggetti)</div><div class="loot-grid">`;
  loot.forEach(item => {
    const set = SETS[item.setId];
    html += `<div class="loot-item" style="border-color:${rarityBorderColor(item.rarity)};background:rgba(0,0,0,.25)">
      <div class="loot-item-icon">${item.icon}</div>
      <div class="loot-item-info">
        <div class="loot-item-name" style="color:${rarityColor(item.rarity)}">${item.name}
          <span class="rarity-pill rp-${item.rarity}">${RARITY_NAMES[item.rarity]}</span></div>
        <div class="loot-item-sub">${SLOT_NAMES[item.slot]} · ${statsText(item.stats)} ·
          <span style="color:${set.color}">${set.icon} ${set.name}</span></div>
      </div></div>`;
  });
  html += '</div>';
  drop.innerHTML = html;
  document.getElementById('overlay').classList.add('show');
}

function showDefeatOverlay() {
  document.getElementById('ov-icon').textContent = '💀';
  document.getElementById('ov-title').textContent = 'Sconfitto…';
  document.getElementById('ov-body').textContent = '"Solo chi conosce i propri limiti può superarli." Il filosofo si rialza.';
  document.getElementById('ov-rewards').innerHTML =
    `<div class="reward-line" style="color:#e08080">HP ripristinati al 50%</div>
     ${G.domainActive ? '<div class="reward-line" style="color:#e08080">Uscito dal Dominio</div>' : ''}`;
  document.getElementById('ov-item-drop').innerHTML = '';
  document.getElementById('overlay').classList.add('show');
}

function closeOverlay() {
  document.getElementById('overlay').classList.remove('show');

  if (G.player.hp <= 0) {
    const st = computeStats();
    G.player.hp = Math.round(st.maxHp * .5);
    if (G.domainActive) {
      G.domainActive = false; G.domainId = null; G.domainEnemy = 1; G.domainLoot = [];
      document.getElementById('btn-exit-domain').style.display = 'none';
      document.getElementById('domain-progress').style.display = 'none';
    } else {
      G.floor = Math.max(1, G.floor - 2);
    }
    G.battleOver = false; G.playerTurn = true;
    G.playerStatuses = []; G.enemyStatuses = []; G.cooldowns = [0,0,0,0];
    spawnTowerEnemy();
    document.getElementById('btn-attack').disabled = false;
    updateUI(); renderDomains();
    scheduleSave();

  } else if (G.domainActive && G.domainEnemy > 5) {
    // Domain just completed — clean exit
    G.domainActive = false; G.domainId = null; G.domainEnemy = 1; G.domainLoot = [];
    document.getElementById('btn-exit-domain').style.display = 'none';
    document.getElementById('domain-progress').style.display = 'none';
    G.battleOver = false; G.playerTurn = true;
    G.playerStatuses = []; G.enemyStatuses = []; G.cooldowns = [0,0,0,0];
    spawnTowerEnemy();
    document.getElementById('btn-attack').disabled = false;
    updateUI(); renderDomains(); renderUpgrades();
    scheduleSave();

  } else {
    document.getElementById('btn-next').style.display = 'inline-block';
    document.getElementById('btn-attack').disabled = true;
    renderUpgrades(); renderEquip(); renderInventory(); renderDomains();
    if (G.autoMode) setTimeout(nextBattle, 400);
  }
}

// ── AUTO ─────────────────────────────────────────────────────
function toggleAuto() {
  G.autoMode = !G.autoMode;
  const btn = document.getElementById('btn-auto');
  if (G.autoMode) { btn.textContent = '◉ Auto ON';  btn.classList.add('auto-on');    scheduleAuto(); }
  else            { btn.textContent = '◎ Auto OFF'; btn.classList.remove('auto-on'); stopAuto();     }
}
function stopAuto() {
  G.autoMode = false;
  clearTimeout(G.autoTimer);
  const btn = document.getElementById('btn-auto');
  btn.textContent = '◎ Auto OFF'; btn.classList.remove('auto-on');
}
function scheduleAuto() {
  if (!G.autoMode) return;
  G.autoTimer = setTimeout(() => {
    if (G.battleOver && !G.domainActive) { if (!G.player.hp) return; nextBattle(); }
    else if (G.playerTurn && !G.battleOver) {
      const st = computeStats();
      if      (G.player.mp >= 40 && G.cooldowns[3] === 0) useSkill(3);
      else if (G.player.hp < st.maxHp*.4 && G.player.mp >= 20 && G.cooldowns[1] === 0) useSkill(1);
      else if (G.player.mp >= 25 && G.cooldowns[2] === 0) useSkill(2);
      else attack();
    }
    if (G.autoMode) scheduleAuto();
  }, 820);
}

// ── PRESTIGE ─────────────────────────────────────────────────
function prestige() {
  const req = prestigeRequiredFloor();
  if (G.floor < req) return;
  G.prestige++;
  G.prestigeBonus = 1 + G.prestige * .3;
  G.floor = 1; G.wisdom = 0; G.wisdomMult = 1;
  G.upgradeLevels = {dialectics:0,virtue:0,temperance:0,logos:0,insight:0,wisdom_gain:0};
  G.player = {hp:100, baseMaxHp:100+G.prestige*10, mp:60, baseMaxMp:60+G.prestige*5,
              baseMpRegen:3+G.prestige, baseAtk:10+G.prestige*5, baseDef:0, baseCritChance:5+G.prestige*2};
  G.battleOver = false; G.playerStatuses = []; G.enemyStatuses = []; G.cooldowns = [0,0,0,0];
  if (G.domainActive) {
    G.domainActive = false; G.domainId = null; G.domainEnemy = 1;
    document.getElementById('btn-exit-domain').style.display = 'none';
    document.getElementById('domain-progress').style.display = 'none';
  }
  stopAuto(); spawnTowerEnemy();
  addLog(`✦ Reincarnazione ${G.prestige}! ${G.playerName} rinasce. Prossima reincarnazione: piano ${prestigeRequiredFloor()}.`, 'system');
  document.getElementById('prestige-panel').style.display = 'none';
  renderUpgrades(); renderEquip(); renderInventory(); renderDomains(); updateUI(); rotateQuote();
  scheduleSave();
}

// ── UPGRADES ─────────────────────────────────────────────────
function renderUpgrades() {
  const list = document.getElementById('upgrades-list');
  list.innerHTML = '';
  UPGRADES_DEF.forEach(def => {
    const lv   = G.upgradeLevels[def.id];
    const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lv));
    const ok   = G.wisdom >= cost;
    const div  = document.createElement('div'); div.className = 'upgrade-item';
    div.innerHTML = `
      <div class="upgrade-header"><div class="upgrade-name">${def.name}</div><div class="upgrade-level">Lv.${lv}</div></div>
      <div class="upgrade-desc">${def.desc}</div>
      <div class="upgrade-footer">
        <div class="upgrade-cost">🏛 ${cost}</div>
        <div class="upgrade-effect">${lv>0 ? def.getEffect(lv) : ''}</div>
        <button class="upgrade-btn" onclick="buyUpgrade('${def.id}')" ${ok?'':'disabled'}>Compra</button>
      </div>`;
    list.appendChild(div);
  });
  const req = prestigeRequiredFloor();
  const pp  = document.getElementById('prestige-panel');
  if (G.floor >= req && !G.domainActive) {
    pp.style.display = 'block';
    document.getElementById('prestige-desc').textContent =
      `Reincarnarti darà +${Math.round((G.prestige+1)*30)}% Saggezza permanente. ` +
      `Gli oggetti equipaggiati si mantengono. Prossima soglia: piano ${req+2}.`;
  } else {
    pp.style.display = 'none';
  }
  document.getElementById('wisdom-count').textContent = G.wisdom;
  document.getElementById('h-wisdom').textContent = G.wisdom;
}

function buyUpgrade(id) {
  const def  = UPGRADES_DEF.find(d => d.id === id);
  const lv   = G.upgradeLevels[id];
  const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lv));
  if (G.wisdom < cost) return;
  G.wisdom -= cost; G.upgradeLevels[id]++;
  def.effect(G);
  const st = computeStats();
  G.player.hp = Math.min(G.player.hp, st.maxHp);
  G.player.mp = Math.min(G.player.mp, st.maxMp);
  addLog(`Potenziamento: <b>${def.name}</b> → Lv.${G.upgradeLevels[id]}.`, 'reward');
  updateUI(); renderUpgrades();
  scheduleSave();
}

// ── EQUIP RENDER ─────────────────────────────────────────────
function renderEquip() {
  const slotsEl = document.getElementById('equip-slots');
  slotsEl.innerHTML = '';
  Object.keys(SLOT_ICONS).forEach(slot => {
    const item = G.equipped[slot];
    const div  = document.createElement('div');
    div.className = 'equip-slot' + (item ? ' has-item rarity-'+item.rarity : '');
    if (item) {
      const set = SETS[item.setId];
      div.innerHTML = `<span class="slot-icon">${item.icon}</span>
        <div class="slot-info">
          <div class="slot-type">${SLOT_NAMES[slot]}</div>
          <div class="slot-item-name">${item.name}</div>
          <div class="slot-item-stats">${statsText(item.stats)}</div>
          <div class="slot-set-tag" style="background:rgba(0,0,0,.2);color:${set.color};border:1px solid ${set.color}">${set.icon} ${set.name}</div>
        </div>
        <button class="slot-unequip" onclick="unequipItem('${slot}')">✕</button>`;
    } else {
      div.innerHTML = `<span class="slot-icon" style="opacity:.3">${SLOT_ICONS[slot]}</span>
        <div class="slot-info"><div class="slot-type">${SLOT_NAMES[slot]}</div><div class="slot-empty">Vuoto</div></div>`;
    }
    slotsEl.appendChild(div);
  });
  // Set bonus summary
  const counts  = getSetCounts();
  const display = document.getElementById('set-bonus-display');
  display.innerHTML = '';
  const allSets = new Set();
  Object.values(G.equipped).forEach(i => { if (i && i.setId) allSets.add(i.setId); });
  if (!allSets.size) {
    display.innerHTML = '<div style="font-size:11px;color:var(--text-dim);font-style:italic">Nessun set attivo.</div>';
    return;
  }
  allSets.forEach(sid => {
    const cnt = counts[sid]||0; const s = SETS[sid];
    const row = document.createElement('div'); row.className = 'set-bonus-row';
    row.style.borderColor = cnt >= 2 ? s.color : 'var(--border)';
    row.innerHTML = `<div class="set-bonus-name" style="color:${s.color}">${s.icon} ${s.name} (${cnt}pz)</div>
      <div class="set-bonus-line ${cnt>=2?'active':'inactive'}">2pc: ${s.desc2}</div>
      <div class="set-bonus-line ${cnt>=4?'active':'inactive'}">4pc: ${s.desc4}</div>`;
    display.appendChild(row);
  });
}

// ── INVENTORY RENDER ─────────────────────────────────────────
function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  document.getElementById('inv-count').textContent = `${G.inventory.length}/30`;
  grid.innerHTML = '';
  let items = G.inventory.filter(i => G.invFilter === 'all' || i.slot === G.invFilter);
  if (!items.length) {
    grid.innerHTML = '<div class="inv-empty">Nessun oggetto'+(G.invFilter!=='all'?' in questo slot':'')+'.<br>Sconfiggi i nemici o completa un Dominio!</div>';
    return;
  }
  items.sort((a,b) => {
    if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
    return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
  });
  items.forEach(item => {
    const set  = SETS[item.setId];
    const isEq = item.equipped;
    const div  = document.createElement('div');
    div.className = 'inv-item' + (isEq ? ' equipped' : '');
    div.innerHTML = `<span class="inv-item-icon">${item.icon}</span>
      <div class="inv-item-info">
        <div class="inv-item-name" style="color:${rarityColor(item.rarity)}">${item.name}
          <span class="rarity-pill rp-${item.rarity}">${RARITY_NAMES[item.rarity]}</span></div>
        <div class="inv-item-sub">${SLOT_NAMES[item.slot]} · ${statsText(item.stats)}</div>
        <div class="inv-item-set" style="color:${set.color}">${set.icon} ${set.name}</div>
      </div>
      <div class="inv-actions">
        <button class="inv-btn inv-btn-equip${isEq?' equipped-btn':''}"
          onclick="${isEq?`unequipItem('${item.slot}')`:`equipItem(${item.id})`}">${isEq?'✕':'+ Equipa'}</button>
        <button class="inv-btn inv-btn-sell" onclick="sellItem(${item.id})" ${isEq?'disabled':''}>🏛 ${SELL_PRICES[item.rarity]}</button>
      </div>`;
    grid.appendChild(div);
  });
}

// ── DOMAINS RENDER ───────────────────────────────────────────
function renderDomains() {
  const list = document.getElementById('domains-list');
  list.innerHTML = '';
  DOMAINS.forEach(dom => {
    const inThis   = G.domainActive && G.domainId === dom.id;
    const canEnter = !G.domainActive && G.wisdom >= DOMAIN_COST;
    const setsHtml = dom.sets.map(sid => {
      const s = SETS[sid];
      return `<div class="set-chip" style="background:rgba(0,0,0,.2);border-color:${s.color};color:${s.color}">${s.icon} ${s.name}</div>`;
    }).join('');
    const setInfo = dom.sets.map(sid => {
      const s = SETS[sid];
      return `<div class="set-info-block">
        <div class="set-info-title" style="color:${s.color}">${s.icon} ${s.name}</div>
        <div class="set-info-bonus">2pc: <span>${s.desc2}</span></div>
        <div class="set-info-bonus">4pc: <span>${s.desc4}</span></div>
      </div>`;
    }).join('');
    const div = document.createElement('div'); div.className = 'domain-card';
    div.style.borderColor  = inThis ? dom.color : 'var(--border)';
    div.style.background   = inThis ? dom.bg    : 'rgba(0,0,0,.15)';
    if (inThis) div.style.borderWidth = '2px';
    div.innerHTML = `
      <div class="domain-card-header">
        <div class="domain-name" style="color:${dom.color}">${dom.icon} ${dom.name}</div>
        <div class="domain-cost-badge">🏛 ${DOMAIN_COST}</div>
      </div>
      <div class="domain-desc">${dom.desc}</div>
      <div class="domain-rewards-line">Drop: <b>3–6 oggetti garantiti</b> · 5 nemici in sequenza</div>
      <div class="domain-sets">${setsHtml}</div>
      <div style="margin-bottom:7px">${setInfo}</div>
      ${inThis
        ? `<div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:1px;color:${dom.color};text-align:center;padding:5px;border:1px solid ${dom.color};border-radius:4px">● IN CORSO — Nemico ${G.domainEnemy}/5</div>`
        : `<button class="domain-enter-btn" style="border-color:${dom.color};color:${dom.color};background:rgba(0,0,0,.2)"
             onclick="enterDomain(${dom.id})" ${canEnter?'':'disabled'}>${G.domainActive?'Termina il dominio attuale':'⚔ Entra nel Dominio'}</button>`
      }`;
    list.appendChild(div);
  });
}

// ── UI UPDATE ────────────────────────────────────────────────
function updateUI() {
  const p = G.player, e = G.enemy, st = computeStats();

  const hpPct = p.hp / st.maxHp * 100;
  const hpFill = document.getElementById('p-hp-bar');
  hpFill.style.width = hpPct + '%';
  hpFill.className = 'bar-fill hp-fill' + (hpPct < 25 ? ' critical' : hpPct < 50 ? ' low' : '');
  document.getElementById('p-hp-txt').textContent = p.hp + '/' + st.maxHp;
  document.getElementById('p-mp-bar').style.width = (p.mp/st.maxMp*100) + '%';
  document.getElementById('p-mp-txt').textContent = p.mp + '/' + st.maxMp;
  document.getElementById('e-hp-bar').style.width = (e.hp/e.maxHp*100) + '%';
  document.getElementById('e-hp-txt').textContent = e.hp + '/' + e.maxHp;

  document.getElementById('h-floor').textContent   = G.floor;
  document.getElementById('h-prestige').textContent= G.prestige;
  document.getElementById('h-kills').textContent   = G.totalKills;
  document.getElementById('h-wisdom').textContent  = G.wisdom;
  document.getElementById('wisdom-count').textContent = G.wisdom;

  document.getElementById('stat-atk').textContent  = st.atk;
  document.getElementById('stat-def').textContent  = st.def;
  document.getElementById('stat-maxhp').textContent= st.maxHp;
  document.getElementById('stat-crit').textContent = st.critChance;
  document.getElementById('stat-logos').textContent= st.maxMp;

  if (!document.getElementById('name-input-field'))
    document.getElementById('player-name-display').textContent = G.playerName;

  const sp = getActiveBonus4Specials();
  SKILLS.forEach((_, i) => {
    const btn = document.getElementById('skill-' + i);
    const cd  = G.cooldowns[i];
    btn.disabled = !G.playerTurn || G.battleOver;
    const oldCd = btn.querySelector('.skill-cd');
    if (oldCd) oldCd.remove();
    if (cd > 0) {
      btn.classList.add('on-cooldown');
      const cdDiv = document.createElement('div'); cdDiv.className = 'skill-cd'; cdDiv.textContent = cd;
      btn.appendChild(cdDiv);
    } else btn.classList.remove('on-cooldown');
  });
  const boostMap = {3:'aporiaBoost', 1:'maieuticaBoost', 2:'eironeiaBuff', 0:'elenchosDouble'};
  Object.entries(boostMap).forEach(([i,key]) => {
    document.getElementById('skill-'+i)?.classList.toggle('boosted', sp.has(key));
  });

  document.getElementById('player-card').classList.toggle('active-turn', G.playerTurn && !G.battleOver);
  document.getElementById('enemy-card').classList.toggle('active-turn', !G.playerTurn && !G.battleOver);
  renderStatuses('player-statuses', G.playerStatuses);
  renderStatuses('enemy-statuses',  G.enemyStatuses);

  let title = 'Il Filosofo';
  if (G.totalKills >= 50)  title = 'Il Saggio';
  if (G.totalKills >= 100) title = 'Il Maestro';
  if (G.prestige >= 1)     title = 'L\'Immortale';
  if (G.prestige >= 3)     title = 'L\'Eterno';
  document.getElementById('player-title').textContent = title;

  const req = prestigeRequiredFloor();
  const pp  = document.getElementById('prestige-panel');
  if (G.floor >= req && !G.domainActive) {
    pp.style.display = 'block';
    document.getElementById('prestige-desc').textContent =
      `Reincarnarti darà +${Math.round((G.prestige+1)*30)}% Saggezza permanente. Prossima soglia salirà a piano ${req+2}.`;
  } else {
    pp.style.display = 'none';
  }
}

function renderStatuses(elId, statuses) {
  const el = document.getElementById(elId); el.innerHTML = '';
  statuses.forEach(s => {
    const b = document.createElement('span');
    b.className = `status-badge status-${s.type}`; b.textContent = s.name + ' ' + s.turns;
    el.appendChild(b);
  });
}

// ── HELPERS ──────────────────────────────────────────────────
function statsText(stats) {
  const labels = {atk:'ATK',def:'DEF',maxHp:'HP',critChance:'Crit%',maxMp:'Logos',mpRegen:'Regen'};
  return Object.entries(stats).map(([k,v]) => `+${v} ${labels[k]||k}`).join(' ');
}
function rarityColor(r) {
  return {common:'var(--common)',uncommon:'var(--uncommon)',rare:'var(--rare)',legendary:'var(--legendary)'}[r]||'var(--text)';
}
function rarityBorderColor(r) {
  return {common:'rgba(160,144,112,.4)',uncommon:'rgba(90,170,90,.4)',rare:'rgba(80,144,208,.4)',legendary:'rgba(232,160,48,.5)'}[r]||'var(--border)';
}
function rotateQuote() {
  document.getElementById('quote-bar').textContent = QUOTES[Math.floor(Math.random()*QUOTES.length)];
}

// ── TABS ─────────────────────────────────────────────────────
function switchTab(name) {
  const names = ['upgrades','equip','inventory','domains'];
  document.querySelectorAll('.tab-btn').forEach((b,i) => b.classList.toggle('active', names[i]===name));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if (name === 'equip')     renderEquip();
  if (name === 'inventory') renderInventory();
  if (name === 'domains')   renderDomains();
}

// ── NAME EDIT ────────────────────────────────────────────────
function startEditName() {
  const display = document.getElementById('player-name-display');
  display.style.display = 'none';
  const input = document.createElement('input');
  input.className = 'name-input'; input.value = G.playerName;
  input.maxLength = 16; input.id = 'name-input-field';
  display.parentNode.insertBefore(input, display);
  input.focus(); input.select();
  const confirm = () => {
    const val = input.value.trim() || 'Socrate';
    G.playerName = val;
    display.textContent = val; display.style.display = '';
    input.remove();
    addLog(`✦ Il filosofo si chiama ora: <b>${val}</b>.`, 'system');
    scheduleSave();
  };
  input.addEventListener('blur', confirm);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') { display.style.display = ''; input.remove(); }
  });
}

// ── INIT ─────────────────────────────────────────────────────
function init() {
  const loaded = loadGame();
  spawnTowerEnemy();   // always spawn a fresh enemy (battle state is reset on load)
  updateUI();
  renderUpgrades();
  renderEquip();
  renderInventory();
  renderDomains();
  rotateQuote();
  setInterval(rotateQuote, 30000);

  if (loaded) {
    addLog(`✦ Benvenuto di ritorno, ${G.playerName}! Piano ${G.floor}, Reinc. ${G.prestige}.`, 'system');
  } else {
    addLog(`${G.playerName} si avvicina al primo sfidante…`, 'system');
    addLog('✦ Completa i Domini per guadagnare 3–6 oggetti set garantiti!', 'system');
    addLog(`✦ Prima reincarnazione disponibile al piano ${prestigeRequiredFloor()}.`, 'system');
  }
}

init();
